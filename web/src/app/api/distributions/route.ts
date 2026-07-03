import { NextRequest, NextResponse } from 'next/server';
import { getDistributionsByAuthor, createDistribution, deleteDistribution } from '@/lib/distributions';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('authorId');

    if (!authorId) {
        return NextResponse.json({ error: 'authorId query param is required.' }, { status: 400 });
    }

    try {
        const distributions = await getDistributionsByAuthor(authorId);
        return NextResponse.json(distributions);
    } catch (err: unknown) {
        console.error('Get distributions error:', err);
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { bookId, distributorId, format, notes } = await req.json();

    if (!bookId || !distributorId) {
        return NextResponse.json({ error: 'bookId and distributorId are required.' }, { status: 400 });
    }

    try {
        const distribution = await createDistribution({ bookId, distributorId, format, notes });
        return NextResponse.json(distribution);
    } catch (err: unknown) {
        console.error('Create distribution error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteDistribution(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Distribution not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
