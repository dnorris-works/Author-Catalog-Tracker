import { NextRequest, NextResponse } from 'next/server';
import { getAllBooks, createBook, updateBook, deleteBook } from '@/lib/books';

export async function GET() {
    const books = await getAllBooks();
    return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { title, subtitle, isbn10, isbn13, authorId, distributorId, publicationDate, edition, pageCount, language, summary, coverImageUrl } = body;

    if (!title || !authorId) {
        return NextResponse.json({ error: 'title and authorId are required.' }, { status: 400 });
    }

    try {
        const book = await createBook({ title, subtitle, isbn10, isbn13, authorId, distributorId, publicationDate, edition, pageCount, language, summary, coverImageUrl });
        return NextResponse.json(book);
    } catch (err: unknown) {
        console.error('Create book error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, title, subtitle, isbn10, isbn13, authorId, distributorId, publicationDate, edition, pageCount, language, summary, coverImageUrl } = body;

    if (!id || !title || !authorId) {
        return NextResponse.json({ error: 'id, title, and authorId are required.' }, { status: 400 });
    }

    try {
        const book = await updateBook(id, { title, subtitle, isbn10, isbn13, authorId, distributorId, publicationDate, edition, pageCount, language, summary, coverImageUrl });
        if (!book) {
            return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
        }
        return NextResponse.json(book);
    } catch (err: unknown) {
        console.error('Update book error:', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    const deleted = await deleteBook(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
