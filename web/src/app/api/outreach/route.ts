import { NextRequest, NextResponse } from 'next/server';
import { getAllOutreach, createOutreach, updateOutreach, deleteOutreach } from '@/lib/outreach';
import { errorResponse } from '@/lib/api-error';

export async function GET() {
    try {
        const outreach = await getAllOutreach();
        return NextResponse.json(outreach);
    } catch (err: unknown) {
        return errorResponse(err, 'Get outreach error:');
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
        return errorResponse(err, 'Create outreach error:');
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
        return errorResponse(err, 'Update outreach error:');
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    try {
        const deleted = await deleteOutreach(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Outreach record not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        return errorResponse(err, 'Delete outreach error:');
    }
}
