'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Author } from '@/lib/authors';

type Props = {
    authors: Author[];
};

type AuthorForm = {
    id: string | null;
    firstName: string;
    lastName: string;
    penName: string;
    email: string;
    website: string;
    bio: string;
};

const emptyForm: AuthorForm = {
    id: null,
    firstName: '',
    lastName: '',
    penName: '',
    email: '',
    website: '',
    bio: '',
};

export default function AdminDashboardClient({ authors }: Props) {
    const router = useRouter();
    const [editing, setEditing] = useState<AuthorForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    async function handleLogout() {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin');
    }

    function startNew() {
        setEditing({ ...emptyForm });
        setError('');
        setSuccess('');
    }

    function startEdit(author: Author) {
        setEditing({
            id: author.id,
            firstName: author.firstName,
            lastName: author.lastName,
            penName: author.penName ?? '',
            email: author.email ?? '',
            website: author.website ?? '',
            bio: author.bio ?? '',
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
        const body = editId
            ? { id: editId, ...fields }
            : fields;

        const res = await fetch('/api/admin/authors', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setSuccess(editing.id ? 'Author updated.' : 'Author created.');
            setEditing(null);
            router.refresh();
        } else {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this author? This cannot be undone.')) return;

        const res = await fetch('/api/admin/authors', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            router.refresh();
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                    Admin Dashboard
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={startNew}
                        className="text-sm px-4 py-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                    >
                        + Add Author
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* Status messages */}
            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>}

            {/* Edit/Create Form */}
            {editing && (
                <div className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {editing.id ? 'Edit Author' : 'New Author'}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                First Name *
                            </label>
                            <input
                                id="firstName"
                                type="text"
                                required
                                value={editing.firstName}
                                onChange={(e) => setEditing({ ...editing, firstName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Last Name *
                            </label>
                            <input
                                id="lastName"
                                type="text"
                                required
                                value={editing.lastName}
                                onChange={(e) => setEditing({ ...editing, lastName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="penName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Pen Name
                            </label>
                            <input
                                id="penName"
                                type="text"
                                value={editing.penName}
                                onChange={(e) => setEditing({ ...editing, penName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={editing.email}
                                onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="website" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Website
                            </label>
                            <input
                                id="website"
                                type="url"
                                value={editing.website}
                                onChange={(e) => setEditing({ ...editing, website: e.target.value })}
                                placeholder="https://"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="bio" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                rows={4}
                                value={editing.bio}
                                onChange={(e) => setEditing({ ...editing, bio: e.target.value })}
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
                            {saving ? 'Saving...' : editing.id ? 'Update Author' : 'Save Author'}
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

            {/* Authors Table */}
            {authors.length === 0 && !editing ? (
                <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">No authors yet.</p>
                    <p className="mt-1 text-sm">Click &quot;+ Add Author&quot; to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                                <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Pen Name</th>
                                <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Email</th>
                                <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authors.map((author) => (
                                <tr key={author.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                    <td className="py-3 px-2 text-zinc-900 dark:text-zinc-100">
                                        {author.firstName} {author.lastName}
                                    </td>
                                    <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                        {author.penName || '—'}
                                    </td>
                                    <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                        {author.email || '—'}
                                    </td>
                                    <td className="py-3 px-2">
                                        <button
                                            onClick={() => startEdit(author)}
                                            className="mr-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(author.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
