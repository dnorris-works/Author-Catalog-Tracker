import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllPublishers, createPublisher, updatePublisher, deletePublisher } from '@/lib/publishers';

export async function GET() {
    const authed = await isAuthenticated();
    if (!authed) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const publishers = await getAllPublishers();
    return NextResponse.json(publishers);
}

export async function POST(req: NextRequest) {
    const authed = await isAuthenticated();
    if (!authed) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, website, email, phone, address } = await req.json();

    if (!name) {
        return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }

    try {
        const publisher = await createPublisher({ name, website, email, phone, address });
        return NextResponse.json(publisher);
    } catch (err: unknown) {
        console.error('Create publisher error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const authed = await isAuthenticated();
    if (!authed) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id, name, website, email, phone, address } = await req.json();

    if (!id || !name) {
        return NextResponse.json({ error: 'id and name are required.' }, { status: 400 });
    }

    try {
        const publisher = await updatePublisher(id, { name, website, email, phone, address });
        if (!publisher) {
            return NextResponse.json({ error: 'Publisher not found.' }, { status: 404 });
        }
        return NextResponse.json(publisher);
    } catch (err: unknown) {
        console.error('Update publisher error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const authed = await isAuthenticated();
    if (!authed) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deletePublisher(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Publisher not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
