import { NextRequest, NextResponse } from 'next/server';
import { getAllOrganizations, createOrganization, updateOrganization, deleteOrganization } from '@/lib/organizations';

export async function GET() {
    const orgs = await getAllOrganizations();
    return NextResponse.json(orgs);
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
        console.error('Create organization error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
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
        console.error('Update organization error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteOrganization(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Organization not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
