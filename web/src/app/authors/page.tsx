import { getAllAuthors } from '@/lib/authors';
import Link from 'next/link';

export default async function AuthorsPage() {
    const authors = await getAllAuthors();

    return (
        <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Authors
                </h1>
                <Link
                    href="/admin/dashboard"
                    className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                >
                    Manage &rarr;
                </Link>
            </div>

            {authors.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
                    <p className="text-lg">No authors yet.</p>
                    <p className="mt-1 text-sm">Authors added via the admin dashboard will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {authors.map((author) => (
                        <div
                            key={author.id}
                            className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
                        >
                            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                {author.firstName} {author.lastName}
                            </h2>
                            {author.penName && (
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    Writing as {author.penName}
                                </p>
                            )}
                            {author.bio && (
                                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                                    {author.bio}
                                </p>
                            )}
                            {author.website && (
                                <a
                                    href={author.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-block text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                                >
                                    Visit website &rarr;
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
