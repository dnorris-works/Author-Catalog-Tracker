'use client';

import { useState, useEffect } from 'react';

type Organization = { id: string; name: string };
type Book = { id: string; title: string };

type OutreachView = {
    contactId: string;
    organizationId: string;
    organizationName: string;
    contactName: string | null;
    contactTitle: string | null;
    contactEmail: string | null;
    bookId: string | null;
    bookTitle: string | null;
    authorName: string | null;
    formatSent: string | null;
    deliveryMethod: string | null;
    templateUsed: string | null;
    dateSent: string | null;
    followUpDate: string | null;
    followUpCount: number;
    responseReceived: boolean;
    responseType: string | null;
    outcome: string | null;
    bulkOrderQty: number | null;
    nextAction: string | null;
    optOut: boolean;
};

type OutreachForm = {
    id: string | null;
    organizationId: string;
    bookId: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    contactPhone: string;
    formatSent: string;
    deliveryMethod: string;
    templateUsed: string;
    dateSent: string;
    followUpDate: string;
    followUpCount: number;
    responseReceived: boolean;
    responseDate: string;
    responseType: string;
    responseNotes: string;
    outcome: string;
    bulkOrderQty: string;
    nextAction: string;
    optOut: boolean;
};

const emptyForm: OutreachForm = {
    id: null,
    organizationId: '',
    bookId: '',
    contactName: '',
    contactTitle: '',
    contactEmail: '',
    contactPhone: '',
    formatSent: '',
    deliveryMethod: '',
    templateUsed: '',
    dateSent: '',
    followUpDate: '',
    followUpCount: 0,
    responseReceived: false,
    responseDate: '',
    responseType: '',
    responseNotes: '',
    outcome: 'Pending',
    bulkOrderQty: '',
    nextAction: '',
    optOut: false,
};

export default function OutreachPage() {
    const [outreach, setOutreach] = useState<OutreachView[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [editing, setEditing] = useState<OutreachForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadOutreach();
        loadOrganizations();
        loadBooks();
    }, []);

    async function loadOutreach() {
        const res = await fetch('/api/outreach');
        if (res.ok) setOutreach(await res.json());
    }

    async function loadOrganizations() {
        const res = await fetch('/api/organizations');
        if (res.ok) setOrganizations(await res.json());
    }

    async function loadBooks() {
        const res = await fetch('/api/books');
        if (res.ok) setBooks(await res.json());
    }

    function startNew() {
        setEditing({ ...emptyForm });
        setError('');
        setSuccess('');
    }

    function startEdit(item: OutreachView) {
        setEditing({
            id: item.contactId,
            organizationId: item.organizationId,
            bookId: item.bookId ?? '',
            contactName: item.contactName ?? '',
            contactTitle: item.contactTitle ?? '',
            contactEmail: item.contactEmail ?? '',
            contactPhone: '',
            formatSent: item.formatSent ?? '',
            deliveryMethod: item.deliveryMethod ?? '',
            templateUsed: item.templateUsed ?? '',
            dateSent: item.dateSent ?? '',
            followUpDate: item.followUpDate ?? '',
            followUpCount: item.followUpCount,
            responseReceived: item.responseReceived,
            responseDate: '',
            responseType: item.responseType ?? '',
            responseNotes: '',
            outcome: item.outcome ?? 'Pending',
            bulkOrderQty: item.bulkOrderQty?.toString() ?? '',
            nextAction: item.nextAction ?? '',
            optOut: item.optOut,
        });
        setError('');
        setSuccess('');
    }

    async function handleSave() {
        if (!editing) return;
        if (!editing.organizationId) {
            setError('Please select an organization.');
            return;
        }
        setSaving(true);
        setError('');
        setSuccess('');

        const method = editing.id ? 'PUT' : 'POST';
        const body = {
            ...(editing.id ? { id: editing.id } : {}),
            organizationId: editing.organizationId,
            bookId: editing.bookId || undefined,
            contactName: editing.contactName || undefined,
            contactTitle: editing.contactTitle || undefined,
            contactEmail: editing.contactEmail || undefined,
            contactPhone: editing.contactPhone || undefined,
            formatSent: editing.formatSent || undefined,
            deliveryMethod: editing.deliveryMethod || undefined,
            templateUsed: editing.templateUsed || undefined,
            dateSent: editing.dateSent || undefined,
            followUpDate: editing.followUpDate || undefined,
            followUpCount: editing.followUpCount,
            responseReceived: editing.responseReceived,
            responseDate: editing.responseDate || undefined,
            responseType: editing.responseType || undefined,
            responseNotes: editing.responseNotes || undefined,
            outcome: editing.outcome || undefined,
            bulkOrderQty: editing.bulkOrderQty ? parseInt(editing.bulkOrderQty) : undefined,
            nextAction: editing.nextAction || undefined,
            optOut: editing.optOut,
        };

        const res = await fetch('/api/outreach', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (res.ok) {
            setSuccess(editing.id ? 'Outreach updated.' : 'Outreach created.');
            setEditing(null);
            await loadOutreach();
        } else {
            const data = await res.json();
            setError(data.error ?? 'Something went wrong.');
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this outreach record?')) return;
        const res = await fetch('/api/outreach', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) await loadOutreach();
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Outreach
                </h1>
                {!editing && (
                    <button
                        onClick={startNew}
                        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
                    >
                        + New Outreach
                    </button>
                )}
            </div>

            {error && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400">{success}</p>}

            {editing && (
                <div className="mb-10 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                        {editing.id ? 'Edit Outreach' : 'New Outreach'}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Organization */}
                        <div>
                            <label htmlFor="organizationId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Organization *
                            </label>
                            <select
                                id="organizationId"
                                value={editing.organizationId}
                                onChange={(e) => setEditing({ ...editing, organizationId: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="">Select organization...</option>
                                {organizations.map((o) => (
                                    <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Book */}
                        <div>
                            <label htmlFor="bookId" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Book Sent
                            </label>
                            <select
                                id="bookId"
                                value={editing.bookId}
                                onChange={(e) => setEditing({ ...editing, bookId: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="">None</option>
                                {books.map((b) => (
                                    <option key={b.id} value={b.id}>{b.title}</option>
                                ))}
                            </select>
                        </div>
                        {/* Format Sent */}
                        <div>
                            <label htmlFor="formatSent" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Format Sent
                            </label>
                            <select
                                id="formatSent"
                                value={editing.formatSent}
                                onChange={(e) => setEditing({ ...editing, formatSent: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="">Select...</option>
                                <option value="eBook">eBook</option>
                                <option value="Print">Print</option>
                                <option value="ARC">ARC</option>
                            </select>
                        </div>
                        {/* Contact Name */}
                        <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Contact Name
                            </label>
                            <input
                                id="contactName"
                                type="text"
                                value={editing.contactName}
                                onChange={(e) => setEditing({ ...editing, contactName: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Contact Title */}
                        <div>
                            <label htmlFor="contactTitle" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Contact Title
                            </label>
                            <input
                                id="contactTitle"
                                type="text"
                                value={editing.contactTitle}
                                onChange={(e) => setEditing({ ...editing, contactTitle: e.target.value })}
                                placeholder="e.g. Chapter President"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Contact Email */}
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Contact Email
                            </label>
                            <input
                                id="contactEmail"
                                type="email"
                                value={editing.contactEmail}
                                onChange={(e) => setEditing({ ...editing, contactEmail: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Delivery Method */}
                        <div>
                            <label htmlFor="deliveryMethod" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Delivery Method
                            </label>
                            <input
                                id="deliveryMethod"
                                type="text"
                                value={editing.deliveryMethod}
                                onChange={(e) => setEditing({ ...editing, deliveryMethod: e.target.value })}
                                placeholder="e.g. StoryOrigin link, email, mail"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Template Used */}
                        <div>
                            <label htmlFor="templateUsed" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Template Used
                            </label>
                            <input
                                id="templateUsed"
                                type="text"
                                value={editing.templateUsed}
                                onChange={(e) => setEditing({ ...editing, templateUsed: e.target.value })}
                                placeholder="e.g. Email 1 - Gift"
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Date Sent */}
                        <div>
                            <label htmlFor="dateSent" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Date Sent
                            </label>
                            <input
                                id="dateSent"
                                type="date"
                                value={editing.dateSent}
                                onChange={(e) => setEditing({ ...editing, dateSent: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Follow-up Date */}
                        <div>
                            <label htmlFor="followUpDate" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Follow-up Date
                            </label>
                            <input
                                id="followUpDate"
                                type="date"
                                value={editing.followUpDate}
                                onChange={(e) => setEditing({ ...editing, followUpDate: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Follow-up Count */}
                        <div>
                            <label htmlFor="followUpCount" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Follow-up Count
                            </label>
                            <input
                                id="followUpCount"
                                type="number"
                                min="0"
                                value={editing.followUpCount}
                                onChange={(e) => setEditing({ ...editing, followUpCount: parseInt(e.target.value) || 0 })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Response Received */}
                        <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={editing.responseReceived}
                                    onChange={(e) => setEditing({ ...editing, responseReceived: e.target.checked })}
                                    className="rounded"
                                />
                                Response Received
                            </label>
                        </div>
                        {/* Response Type */}
                        <div>
                            <label htmlFor="responseType" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Response Type
                            </label>
                            <select
                                id="responseType"
                                value={editing.responseType}
                                onChange={(e) => setEditing({ ...editing, responseType: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="">Select...</option>
                                <option value="Positive">Positive</option>
                                <option value="Negative">Negative</option>
                                <option value="No Response">No Response</option>
                                <option value="Referred Elsewhere">Referred Elsewhere</option>
                                <option value="Bulk Order Placed">Bulk Order Placed</option>
                            </select>
                        </div>
                        {/* Outcome */}
                        <div>
                            <label htmlFor="outcome" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Outcome
                            </label>
                            <select
                                id="outcome"
                                value={editing.outcome}
                                onChange={(e) => setEditing({ ...editing, outcome: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Declined">Declined</option>
                                <option value="Added to Reading List">Added to Reading List</option>
                                <option value="Bulk Order">Bulk Order</option>
                                <option value="Event Booking">Event Booking</option>
                                <option value="No Outcome">No Outcome</option>
                            </select>
                        </div>
                        {/* Bulk Order Qty */}
                        <div>
                            <label htmlFor="bulkOrderQty" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Bulk Order Qty
                            </label>
                            <input
                                id="bulkOrderQty"
                                type="number"
                                min="0"
                                value={editing.bulkOrderQty}
                                onChange={(e) => setEditing({ ...editing, bulkOrderQty: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Next Action */}
                        <div className="sm:col-span-2 lg:col-span-3">
                            <label htmlFor="nextAction" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Next Action
                            </label>
                            <input
                                id="nextAction"
                                type="text"
                                value={editing.nextAction}
                                onChange={(e) => setEditing({ ...editing, nextAction: e.target.value })}
                                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                            />
                        </div>
                        {/* Opt-out */}
                        <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={editing.optOut}
                                    onChange={(e) => setEditing({ ...editing, optOut: e.target.checked })}
                                    className="rounded"
                                />
                                Opt-out (stop contacting)
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : editing.id ? 'Update' : 'Save'}
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

            {/* Outreach table */}
            {!editing && outreach.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">No outreach records yet.</p>
                    <p className="mt-1 text-sm">Click &quot;+ New Outreach&quot; to log a contact.</p>
                </div>
            ) : (
                !editing && outreach.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Organization</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Contact</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Book</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Format</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Sent</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Outcome</th>
                                    <th className="py-3 px-2 font-medium text-zinc-600 dark:text-zinc-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {outreach.map((item) => (
                                    <tr key={item.contactId} className="border-b border-zinc-100 dark:border-zinc-800/50">
                                        <td className="py-3 px-2 text-zinc-900 dark:text-zinc-100">
                                            {item.organizationName}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {item.contactName || '—'}
                                            {item.contactTitle && <span className="text-xs ml-1 text-zinc-400">({item.contactTitle})</span>}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {item.bookTitle || '—'}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {item.formatSent ? (
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {item.formatSent}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {item.dateSent || '—'}
                                        </td>
                                        <td className="py-3 px-2 text-zinc-600 dark:text-zinc-400">
                                            {item.outcome ? (
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                    item.outcome === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                                    item.outcome === 'Declined' || item.outcome === 'No Outcome' ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' :
                                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                }`}>
                                                    {item.outcome}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="py-3 px-2">
                                            <button
                                                onClick={() => startEdit(item)}
                                                className="mr-3 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.contactId)}
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
