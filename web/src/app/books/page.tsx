'use client';

import { useState, useEffect } from 'react';

type BookIsbn = {
    id: string;
    bookId: string;
    isbn: string;
    format: string | null;
    notes: string | null;
};

type Author = {
    id: string;
    penName: string;
};

type Book = {
    id: string;
    title: string;
    subtitle: string | null;
    authorId: string;
    publicationDate: string | null;
    language: string;
    summary: string | null;
    isbns: BookIsbn[];
};

type BookForm = {
    id: string | null;
    title: string;
    subtitle: string;
    authorId: string;
    publicationDate: string;
    language: string;
    summary: string;
};

const emptyForm: BookForm = {
    id: null,
    title: '',
    subtitle: '',
    authorId: '',
    publicationDate: '',
    language: 'English',
    summary: '',
};

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [editing, setEditing] = useState<BookForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ISBN add form
    const [newIsbn, setNewIsbn] = useState('');
    const [newIsbnFormat, setNewIsbnFormat] = useState('');

    useEffect(() => {
        loadBooks();
        loadAuthors();
    }, []);

    async function loadBooks() {
        const res = await fetch('/api/books');
        if (res.ok) setBooks(await res.json());
    }

    async function loadAuthors() {
        const res = await fetch('/api/authors');
        if (res.ok) setAuthors(await res.json());
    }

    function startNew() {
        setEditing({ ...emptyForm });
        setError('');
        setSuccess('');
    }

    function startEdit(book: Book) {
        setEditing({
            id: book.id,
            title: book.title,
            subtitle: book.subtitle ?? '',
            authorId: book.authorId,
            publicationDate: book.publicationDate ?? '',
            language: book.language,
            summary: book.summary ?? '',
        });
        setError('');
        setSuccess('');
    }

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        setError('');
        setSuccess('');

        const method = editing.id ? 'PUT' : 'POST';
        const { id: editId, ...fields } = editing;
        const body = editId ? { id: editId, ...fields } : fields;

        const res = await fetch('/api/books', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            const savedBook = await res.json();
            if (editing.id) {
                setSuccess('Book updated.');
                setEditing(null);
            } else {
                setSuccess('Book created. You can now add ISBNs below.');
                setEditing({ ...editing, id: savedBook.id });
            }
            await loadBooks();
        } else {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this book? This cannot be undone.')) return;
        const res = await fetch('/api/books', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) await loadBooks();
    }

    async function handleRemoveIsbn(isbnId: string) {
        const res = await fetch('/api/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'removeIsbn', isbnId }),
        });
        if (res.ok) await loadBooks();
    }

    function getAuthorName(authorId: string) {
        return authors.find((a) => a.id === authorId)?.penName ?? '—';
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Books
                </h1>
                {!editing && (
                    <button
                        onClick={startNew}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                    >
                        + Add Book
                    </button>
                )}
            </div>

            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>}

            {editing && (
                <div className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {editing.id ? 'Edit Book' : 'New Book'}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="title" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                value={editing.title}
                                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="subtitle" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Subtitle
                            </label>
                            <input
                                id="subtitle"
                                type="text"
                                value={editing.subtitle}
                                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="authorId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Author *
                            </label>
                            <select
                                id="authorId"
                                required
                                value={editing.authorId}
                                onChange={(e) => setEditing({ ...editing, authorId: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="">Select author...</option>
                                {authors.map((a) => (
                                    <option key={a.id} value={a.id}>{a.penName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="publicationDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Publication Date
                            </label>
                            <input
                                id="publicationDate"
                                type="date"
                                value={editing.publicationDate}
                                onChange={(e) => setEditing({ ...editing, publicationDate: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Language
                            </label>
                            <input
                                id="language"
                                type="text"
                                value={editing.language}
                                onChange={(e) => setEditing({ ...editing, language: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="summary" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Summary
                            </label>
                            <textarea
                                id="summary"
                                rows={3}
                                value={editing.summary}
                                onChange={(e) => setEditing({ ...editing, summary: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                    </div>

                    {/* ISBN section inside form (only for existing books) */}
                    {editing.id && (
                        <div className="mt-6 border-t border-zinc-200 dark:border-zinc-700 pt-4">
                            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">ISBNs</h3>
                            {(() => {
                                const bookIsbns = books.find((b) => b.id === editing.id)?.isbns ?? [];
                                return (
                                    <>
                                        {bookIsbns.length > 0 && (
                                            <div className="space-y-1 mb-3">
                                                {bookIsbns.map((isbn) => (
                                                    <div key={isbn.id} className="flex items-center gap-2 text-sm">
                                                        <code className="text-zinc-700 dark:text-zinc-300">{isbn.isbn}</code>
                                                        {isbn.format && (
                                                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                                {isbn.format}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={() => handleRemoveIsbn(isbn.id)}
                                                            className="text-xs text-red-500 hover:text-red-700"
                                                        >
                                                            remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2 items-end">
                                            <input
                                                type="text"
                                                value={newIsbn}
                                                onChange={(e) => setNewIsbn(e.target.value)}
                                                placeholder="ISBN"
                                                className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            />
                                            <select
                                                value={newIsbnFormat}
                                                onChange={(e) => setNewIsbnFormat(e.target.value)}
                                                className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                                            >
                                                <option value="">Format...</option>
                                                <option value="Print">Print</option>
                                                <option value="eBook">eBook</option>
                                                <option value="Hardcover">Hardcover</option>
                                                <option value="Paperback">Paperback</option>
                                                <option value="Audio">Audio</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (!editing.id || !newIsbn) return;
                                                    const res = await fetch('/api/books', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ action: 'addIsbn', bookId: editing.id, isbn: newIsbn, format: newIsbnFormat || null }),
                                                    });
                                                    if (res.ok) {
                                                        setNewIsbn('');
                                                        setNewIsbnFormat('');
                                                        await loadBooks();
                                                    }
                                                }}
                                                className="rounded bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                                            >
                                                Add ISBN
                                            </button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )}

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editing.id ? 'Update Book' : 'Save Book'}
                        </button>
                        <button
                            onClick={() => setEditing(null)}
                            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {books.length === 0 && !editing ? (
                <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">No books yet.</p>
                    <p className="mt-1 text-sm">Click &quot;+ Add Book&quot; to get started.</p>
                </div>
            ) : (
                books.length > 0 && (
                    <div className="space-y-4">
                        {books.map((book) => (
                            <div key={book.id} className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                                            {book.title}
                                        </h3>
                                        {book.subtitle && (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{book.subtitle}</p>
                                        )}
                                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                            by {getAuthorName(book.authorId)}
                                            {book.publicationDate && ` · ${book.publicationDate}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(book)}
                                            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(book.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* ISBNs */}
                                {book.isbns.length > 0 && (
                                    <div className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">ISBNs</span>
                                        <div className="mt-1 space-y-1">
                                            {book.isbns.map((isbn) => (
                                                <div key={isbn.id} className="flex items-center gap-2 text-sm">
                                                    <code className="text-zinc-700 dark:text-zinc-300">{isbn.isbn}</code>
                                                    {isbn.format && (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                            {isbn.format}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
