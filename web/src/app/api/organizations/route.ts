import { NextRequest, NextResponse } from 'next/server';
import { getAllOrganizations, createOrganization, updateOrganization, deleteOrganization } from '@/lib/organizations';
import { errorResponse } from '@/lib/api-error';

export async function GET() {
    try {
        const orgs = await getAllOrganizations();
        return NextResponse.json(orgs);
    } catch (err: unknown) {
        return errorResponse(err, 'Get organizations error:');
    }
}

export async function POST(req: NextRequest) {
    const { name, contact, email, phone, website, reach, notes } = await req.json();

    if (!name) {
        return NextResponse.json({ error: 'name is required.' }, { status: 400 });
    }

    try {
        const org = await createOrganization({ name, contact, email, phone, website, reach, notes });
        return NextResponse.json(org);
    } catch (err: unknown) {
        return errorResponse(err, 'Create organization error:');
    }
}

export async function PUT(req: NextRequest) {
    const { id, name, contact, email, phone, website, reach, notes } = await req.json();

    if (!id || !name) {
        return NextResponse.json({ error: 'id and name are required.' }, { status: 400 });
    }

    try {
        const org = await updateOrganization(id, { name, contact, email, phone, website, reach, notes });
        if (!org) {
            return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
        }
        return NextResponse.json(org);
    } catch (err: unknown) {
        return errorResponse(err, 'Update organization error:');
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    try {
        const deleted = await deleteOrganization(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        return errorResponse(err, 'Delete organization error:');
    }
}
