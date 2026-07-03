import { NextRequest, NextResponse } from 'next/server';
import { getAllOutreach, createOutreach, updateOutreach, deleteOutreach } from '@/lib/outreach';

export async function GET() {
    try {
        const outreach = await getAllOutreach();
        return NextResponse.json(outreach);
    } catch (err: unknown) {
        console.error('Get outreach error:', err);
        const message = err instanceof Error ? err.message : 'Something went wrong.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!body.organizationId) {
        return NextResponse.json({ error: 'organizationId is required.' }, { status: 400 });
    }

    try {
        const id = await createOutreach(body);
        return NextResponse.json({ id });
    } catch (err: unknown) {
        console.error('Create outreach error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, ...input } = body;

    if (!id || !input.organizationId) {
        return NextResponse.json({ error: 'id and organizationId are required.' }, { status: 400 });
    }

    try {
        const updated = await updateOutreach(id, input);
        if (!updated) {
            return NextResponse.json({ error: 'Outreach record not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        console.error('Update outreach error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteOutreach(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Outreach record not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
