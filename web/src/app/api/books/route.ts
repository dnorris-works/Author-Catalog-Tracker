import { NextRequest, NextResponse } from 'next/server';
import { getAllBooks, createBook, updateBook, deleteBook, addIsbn, removeIsbn } from '@/lib/books';
import { errorResponse } from '@/lib/api-error';

export async function GET() {
    try {
        const books = await getAllBooks();
        return NextResponse.json(books);
    } catch (err: unknown) {
        return errorResponse(err, 'Get books error:');
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();

    // ISBN sub-actions
    if (body.action === 'addIsbn') {
        const { bookId, isbn, format, notes } = body;
        if (!bookId || !isbn) {
            return NextResponse.json({ error: 'bookId and isbn are required.' }, { status: 400 });
        }
        try {
            const result = await addIsbn(bookId, isbn, format, notes);
            return NextResponse.json(result);
        } catch (err: unknown) {
            return errorResponse(err, 'Add ISBN error:');
        }
    }

    if (body.action === 'removeIsbn') {
        const { isbnId } = body;
        if (!isbnId) {
            return NextResponse.json({ error: 'isbnId is required.' }, { status: 400 });
        }
        try {
            const deleted = await removeIsbn(isbnId);
            if (!deleted) {
                return NextResponse.json({ error: 'ISBN not found.' }, { status: 404 });
            }
            return NextResponse.json({ ok: true });
        } catch (err: unknown) {
            return errorResponse(err, 'Remove ISBN error:');
        }
    }

    // Create book
    const { title, subtitle, authorId, publicationDate, language, summary, coverImageUrl } = body;

    if (!title || !authorId) {
        return NextResponse.json({ error: 'title and authorId are required.' }, { status: 400 });
    }

    try {
        const book = await createBook({ title, subtitle, authorId, publicationDate, language, summary, coverImageUrl });
        return NextResponse.json(book);
    } catch (err: unknown) {
        return errorResponse(err, 'Create book error:');
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id, title, subtitle, authorId, publicationDate, language, summary, coverImageUrl } = body;

    if (!id || !title || !authorId) {
        return NextResponse.json({ error: 'id, title, and authorId are required.' }, { status: 400 });
    }

    try {
        const book = await updateBook(id, { title, subtitle, authorId, publicationDate, language, summary, coverImageUrl });
        if (!book) {
            return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
        }
        return NextResponse.json(book);
    } catch (err: unknown) {
        return errorResponse(err, 'Update book error:');
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    try {
        const deleted = await deleteBook(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        return errorResponse(err, 'Delete book error:');
    }
}
