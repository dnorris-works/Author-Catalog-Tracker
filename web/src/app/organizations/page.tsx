'use client';

import { useState, useEffect } from 'react';

type Organization = {
    id: string;
    name: string;
    contact: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    reach: string | null;
    notes: string | null;
};

type OrgForm = {
    id: string | null;
    name: string;
    contact: string;
    email: string;
    phone: string;
    website: string;
    reach: string;
    notes: string;
};

const emptyForm: OrgForm = {
    id: null,
    name: '',
    contact: '',
    email: '',
    phone: '',
    website: '',
    reach: '',
    notes: '',
};

export default function OrganizationsPage() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [editing, setEditing] = useState<OrgForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadOrgs();
    }, []);

    async function loadOrgs() {
        const res = await fetch('/api/organizations');
        if (res.ok) {
            setOrgs(await res.json());
        }
    }

    function startNew() {
        setEditing({ ...emptyForm });
        setError('');
        setSuccess('');
    }

    function startEdit(org: Organization) {
        setEditing({
            id: org.id,
            name: org.name,
            contact: org.contact ?? '',
            email: org.email ?? '',
            phone: org.phone ?? '',
            website: org.website ?? '',
            reach: org.reach ?? '',
            notes: org.notes ?? '',
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

        const res = await fetch('/api/organizations', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setSuccess(editing.id ? 'Organization updated.' : 'Organization created.');
            setEditing(null);
            await loadOrgs();
        } else {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this organization? This cannot be undone.')) return;

        const res = await fetch('/api/organizations', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            await loadOrgs();
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Organizations
                </h1>
                {!editing && (
                    <button
                        onClick={startNew}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                    >
                        + Add Organization
                    </button>
                )}
            </div>

            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>}

            {editing && (
                <div className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {editing.id ? 'Edit Organization' : 'New Organization'}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Name *
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                value={editing.name}
                                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="contact" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Contact
                            </label>
                            <input
                                id="contact"
                                type="text"
                                value={editing.contact}
                                onChange={(e) => setEditing({ ...editing, contact: e.target.value })}
                                placeholder="Person(s) to talk to"
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
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Phone
                            </label>
                            <input
                                id="phone"
                                type="tel"
                                value={editing.phone}
                                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div>
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
                            <label htmlFor="reach" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Reach (schools, groups, places they connect with)
                            </label>
                            <textarea
                                id="reach"
                                rows={3}
                                value={editing.reach}
                                onChange={(e) => setEditing({ ...editing, reach: e.target.value })}
                                placeholder="e.g. St. Mary's High School, Local Library Book Club, University of..."
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                rows={2}
                                value={editing.notes}
                                onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
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
                            {saving ? 'Saving...' : editing.id ? 'Update' : 'Save Organization'}
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

            {orgs.length === 0 && !editing ? (
                <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">No organizations yet.</p>
                    <p className="mt-1 text-sm">Click &quot;+ Add Organization&quot; to get started.</p>
                </div>
            ) : (
                orgs.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Name</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Contact</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Reach</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orgs.map((org) => (
                                    <tr key={org.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                        <td className="py-3 px-2 text-zinc-900 dark:text-zinc-100">
                                            {org.name}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {org.contact || '—'}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                                            {org.reach || '—'}
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => startEdit(org)}
                                                className="mr-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(org.id)}
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
                )
            )}
        </div>
    );
}
