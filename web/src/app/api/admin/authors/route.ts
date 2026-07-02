import { NextRequest, NextResponse } from 'next/server';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } from '@/lib/authors';

export async function GET() {
    const authors = await getAllAuthors();
    return NextResponse.json(authors);
}

export async function POST(req: NextRequest) {
    const { penName, specialty, website } = await req.json();

    if (!penName) {
        return NextResponse.json({ error: 'penName is required.' }, { status: 400 });
    }

    try {
        const author = await createAuthor({ penName, specialty, website });
        return NextResponse.json(author);
    } catch (err: unknown) {
        console.error('Create author error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { id, penName, specialty, website } = await req.json();

    if (!id || !penName) {
        return NextResponse.json({ error: 'id and penName are required.' }, { status: 400 });
    }

    try {
        const author = await updateAuthor(id, { penName, specialty, website });
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
