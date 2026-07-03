import { NextRequest, NextResponse } from 'next/server';
import { getDistributionsByAuthor, createDistribution, deleteDistribution } from '@/lib/distributions';
import { errorResponse } from '@/lib/api-error';

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
        return errorResponse(err, 'Get distributions error:');
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
        return errorResponse(err, 'Create distribution error:');
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    try {
        const deleted = await deleteDistribution(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Distribution not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        return errorResponse(err, 'Delete distribution error:');
    }
}
