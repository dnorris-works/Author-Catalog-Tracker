import { NextRequest, NextResponse } from 'next/server';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '@/lib/authors';

export async function GET() {
    const authors = await getAllAuthors();
    return NextResponse.json(authors);
}

export async function POST(req: NextRequest) {
    const { firstName, lastName, penName, bio, email, website } = await req.json();

    if (!firstName || !lastName) {
        return NextResponse.json({ error: 'firstName and lastName are required.' }, { status: 400 });
    }

    try {
        const author = await createAuthor({ firstName, lastName, penName, bio, email, website });
        return NextResponse.json(author);
    } catch (err: unknown) {
        console.error('Create author error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { id, firstName, lastName, penName, bio, email, website } = await req.json();

    if (!id || !firstName || !lastName) {
        return NextResponse.json({ error: 'id, firstName, and lastName are required.' }, { status: 400 });
    }

    try {
        const author = await updateAuthor(id, { firstName, lastName, penName, bio, email, website });
        if (!author) {
            return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
        }
        return NextResponse.json(author);
    } catch (err: unknown) {
        console.error('Update author error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteAuthor(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
