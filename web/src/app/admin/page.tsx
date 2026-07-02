'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin/dashboard');
        } else {
            const data = await res.json();
            setError(data.error ?? 'Login failed.');
        }
        setLoading(false);
    }

    return (
        <div className="mx-auto max-w-sm px-6 py-32">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 text-center">
                Admin Login
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
                    />
                </div>
                {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
