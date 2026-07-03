'use client';

import { useState, useEffect } from 'react';

type Author = { id: string; penName: string };
type Book = { id: string; title: string; authorId: string };
type Distributor = { id: string; name: string };

type DistributionView = {
    id: string;
    bookId: string;
    bookTitle: string;
    distributorId: string;
    distributorName: string;
    format: string | null;
    notes: string | null;
};

type AddForm = {
    bookId: string;
    distributorId: string;
    format: string;
    notes: string;
};

const emptyForm: AddForm = {
    bookId: '',
    distributorId: '',
    format: '',
    notes: '',
};

export default function DistributionsPage() {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [selectedAuthorId, setSelectedAuthorId] = useState<string>('');
    const [books, setBooks] = useState<Book[]>([]);
    const [distributors, setDistributors] = useState<Distributor[]>([]);
    const [distributions, setDistributions] = useState<DistributionView[]>([]);
    const [adding, setAdding] = useState<AddForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadAuthors();
        loadDistributors();
        loadBooks();
    }, []);

    useEffect(() => {
        if (selectedAuthorId) {
            loadDistributions();
        } else {
            setDistributions([]);
        }
    }, [selectedAuthorId]);

    async function loadAuthors() {
        const res = await fetch('/api/authors');
        if (res.ok) setAuthors(await res.json());
    }

    async function loadBooks() {
        const res = await fetch('/api/books');
        if (res.ok) setBooks(await res.json());
    }

    async function loadDistributors() {
        const res = await fetch('/api/distributors');
        if (res.ok) setDistributors(await res.json());
    }

    async function loadDistributions() {
        if (!selectedAuthorId) return;
        const res = await fetch(`/api/distributions?authorId=${selectedAuthorId}`);
        if (res.ok) setDistributions(await res.json());
    }

    function startAdd() {
        setAdding({ ...emptyForm });
        setError('');
        setSuccess('');
    }

    async function handleSave() {
        if (!adding) return;
        if (!adding.bookId || !adding.distributorId) {
            setError('Please select a book and a distributor.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');

        const res = await fetch('/api/distributions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adding),
        });

        if (res.ok) {
            setSuccess('Distribution added.');
            setAdding(null);
            await loadDistributions();
        } else {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Remove this distribution?')) return;
        const res = await fetch('/api/distributions', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) await loadDistributions();
    }

    // Filter books to selected author
    const authorBooks = books.filter((b) => b.authorId === selectedAuthorId);

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
                Distributions
            </h1>

            {/* Author selector */}
            <div className="mb-8">
                <label htmlFor="authorSelect" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Select Author
                </label>
                <select
                    id="authorSelect"
                    value={selectedAuthorId}
                    onChange={(e) => { setSelectedAuthorId(e.target.value); setAdding(null); setError(''); setSuccess(''); }}
                    className="w-full max-w-sm rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                >
                    <option value="">Choose an author...</option>
                    {authors.map((a) => (
                        <option key={a.id} value={a.id}>{a.penName}</option>
                    ))}
                </select>
            </div>

            {selectedAuthorId && (
                <>
                    {/* Add button */}
                    {!adding && (
                        <div className="mb-6">
                            <button
                                onClick={startAdd}
                                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                            >
                                + Add Distribution
                            </button>
                        </div>
                    )}

                    {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
                    {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>}

                    {/* Add form */}
                    {adding && (
                        <div className="mb-8 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                                Add Distribution
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="bookId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Book *
                                    </label>
                                    <select
                                        id="bookId"
                                        value={adding.bookId}
                                        onChange={(e) => setAdding({ ...adding, bookId: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                    >
                                        <option value="">Select book...</option>
                                        {authorBooks.map((b) => (
                                            <option key={b.id} value={b.id}>{b.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="distributorId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Distributor *
                                    </label>
                                    <select
                                        id="distributorId"
                                        value={adding.distributorId}
                                        onChange={(e) => setAdding({ ...adding, distributorId: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                    >
                                        <option value="">Select distributor...</option>
                                        {distributors.map((d) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="format" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Format
                                    </label>
                                    <select
                                        id="format"
                                        value={adding.format}
                                        onChange={(e) => setAdding({ ...adding, format: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                    >
                                        <option value="">Any / Both</option>
                                        <option value="Print">Print</option>
                                        <option value="eBook">eBook</option>
                                        <option value="Both">Both</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                        Notes
                                    </label>
                                    <input
                                        id="notes"
                                        type="text"
                                        value={adding.notes}
                                        onChange={(e) => setAdding({ ...adding, notes: e.target.value })}
                                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => setAdding(null)}
                                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Distributions table */}
                    {!adding && distributions.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                            <p className="text-lg">No distributions for this author yet.</p>
                            <p className="mt-1 text-sm">Click &quot;+ Add Distribution&quot; to place a book with a distributor.</p>
                        </div>
                    ) : (
                        !adding && distributions.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                            <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Book</th>
                                            <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Distributor</th>
                                            <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Format</th>
                                            <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Notes</th>
                                            <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {distributions.map((dist) => (
                                            <tr key={dist.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                                <td className="py-3 px-2 text-zinc-900 dark:text-zinc-100">
                                                    {dist.bookTitle}
                                                </td>
                                                <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                                    {dist.distributorName}
                                                </td>
                                                <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                                    {dist.format ? (
                                                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                            {dist.format}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                                    {dist.notes || '—'}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <button
                                                        onClick={() => handleDelete(dist.id)}
                                                        className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </>
            )}

            {!selectedAuthorId && (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">Select an author to view and manage distributions.</p>
                </div>
            )}
        </div>
    );
}
