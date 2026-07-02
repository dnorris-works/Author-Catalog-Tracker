import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getAllAuthors } from '@/lib/authors';
import AdminDashboardClient from '@/components/AdminDashboard';

export default async function DashboardPage() {
    const authed = await isAuthenticated();
    if (!authed) redirect('/admin');

    const authors = await getAllAuthors();

    return <AdminDashboardClient authors={authors} />;
}
