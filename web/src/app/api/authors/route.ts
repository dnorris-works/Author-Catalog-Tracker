import { NextRequest, NextResponse } from 'next/server';
import { getAllAuthors, createAuthor, updateAuthor, deleteAuthor, getAuthorBookCount } from '@/lib/authors';
import { ApiError, errorResponse } from '@/lib/api-error';

export async function GET() {
    try {
        const authors = await getAllAuthors();
        return NextResponse.json(authors);
    } catch (err: unknown) {
        return errorResponse(err, 'Get authors error:');
    }
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
        return errorResponse(err, 'Create author error:');
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
        return errorResponse(err, 'Update author error:');
    }
}

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }

    try {
        const bookCount = await getAuthorBookCount(id);
        if (bookCount > 0) {
            throw new ApiError(
                `Cannot delete this author: ${bookCount} book${bookCount === 1 ? ' is' : 's are'} still linked to them. Delete or reassign ${bookCount === 1 ? 'it' : 'them'} first.`,
                409
            );
        }

        const deleted = await deleteAuthor(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Author not found.' }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch (err: unknown) {
        return errorResponse(err, 'Delete author error:');
    }
}
