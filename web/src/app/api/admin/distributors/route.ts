import { NextRequest, NextResponse } from 'next/server';
import { getAllDistributors, createDistributor, updateDistributor, deleteDistributor } from '@/lib/distributors';

export async function GET() {
    const distributors = await getAllDistributors();
    return NextResponse.json(distributors);
}

export async function POST(req: NextRequest) {
    const { name, website, email, phone, address } = await req.json();

    if (!name) {
        return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }

    try {
        const distributor = await createDistributor({ name, website, email, phone, address });
        return NextResponse.json(distributor);
    } catch (err: unknown) {
        console.error('Create distributor error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { id, name, website, email, phone, address } = await req.json();

    if (!id || !name) {
        return NextResponse.json({ error: 'id and name are required.' }, { status: 400 });
    }

    try {
        const distributor = await updateDistributor(id, { name, website, email, phone, address });
        if (!distributor) {
            return NextResponse.json({ error: 'Distributor not found.' }, { status: 404 });
        }
        return NextResponse.json(distributor);
    } catch (err: unknown) {
        console.error('Update distributor error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteDistributor(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Distributor not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
