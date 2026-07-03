import { getPool } from './db';
import { ApiError } from './api-error';

export type BookIsbn = {
    id: string;
    bookId: string;
    isbn: string;
    format: string | null;
    notes: string | null;
};

export type Book = {
    id: string;
    title: string;
    subtitle: string | null;
    authorId: string;
    publicationDate: string | null;
    language: string;
    summary: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    isbns?: BookIsbn[];
};

type BookRow = {
    id: string;
    title: string;
    subtitle: string | null;
    author_id: string;
    publication_date: string | null;
    language: string;
    summary: string | null;
    cover_image_url: string | null;
    created_at: Date;
    updated_at: Date;
};

function toBook(row: BookRow): Book {
    return {
        id: row.id,
        title: row.title,
        subtitle: row.subtitle,
        authorId: row.author_id,
        publicationDate: row.publication_date,
        language: row.language,
        summary: row.summary,
        coverImageUrl: row.cover_image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getAllBooks(): Promise<Book[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const [booksResult, isbnsResult] = await Promise.all([
        pool.query(
            `SELECT id, title, subtitle, author_id, publication_date, language, summary, cover_image_url, created_at, updated_at
             FROM tracker.books
             ORDER BY title ASC`
        ),
        pool.query(
            `SELECT id, book_id, isbn, format, notes FROM tracker.book_isbns ORDER BY created_at ASC`
        ),
    ]);

    const isbnsByBook = new Map<string, BookIsbn[]>();
    for (const row of isbnsResult.rows) {
        const isbn: BookIsbn = { id: row.id, bookId: row.book_id, isbn: row.isbn, format: row.format, notes: row.notes };
        if (!isbnsByBook.has(row.book_id)) isbnsByBook.set(row.book_id, []);
        isbnsByBook.get(row.book_id)!.push(isbn);
    }

    return booksResult.rows.map((row) => ({
        ...toBook(row),
        isbns: isbnsByBook.get(row.id) ?? [],
    }));
}

export async function getBookById(id: string): Promise<Book | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const [bookResult, isbnsResult] = await Promise.all([
        pool.query(
            `SELECT id, title, subtitle, author_id, publication_date, language, summary, cover_image_url, created_at, updated_at
             FROM tracker.books WHERE id = $1`,
            [id]
        ),
        pool.query(
            `SELECT id, book_id, isbn, format, notes FROM tracker.book_isbns WHERE book_id = $1 ORDER BY created_at ASC`,
            [id]
        ),
    ]);

    if (bookResult.rows.length === 0) return null;
    const isbns: BookIsbn[] = isbnsResult.rows.map((r) => ({ id: r.id, bookId: r.book_id, isbn: r.isbn, format: r.format, notes: r.notes }));
    return { ...toBook(bookResult.rows[0]), isbns };
}

export async function createBook(input: {
    title: string;
    subtitle?: string;
    authorId: string;
    publicationDate?: string;
    language?: string;
    summary?: string;
    coverImageUrl?: string;
}): Promise<Book> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.books (title, subtitle, author_id, publication_date, language, summary, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, subtitle, author_id, publication_date, language, summary, cover_image_url, created_at, updated_at`,
        [
            input.title,
            input.subtitle || null,
            input.authorId,
            input.publicationDate || null,
            input.language || 'English',
            input.summary || null,
            input.coverImageUrl || null,
        ]
    );

    return { ...toBook(result.rows[0]), isbns: [] };
}

export async function updateBook(
    id: string,
    input: {
        title: string;
        subtitle?: string;
        authorId: string;
        publicationDate?: string;
        language?: string;
        summary?: string;
        coverImageUrl?: string;
    }
): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.books
         SET title = $2, subtitle = $3, author_id = $4, publication_date = $5, language = $6, summary = $7, cover_image_url = $8
         WHERE id = $1
         RETURNING id, title, subtitle, author_id, publication_date, language, summary, cover_image_url, created_at, updated_at`,
        [
            id,
            input.title,
            input.subtitle || null,
            input.authorId,
            input.publicationDate || null,
            input.language || 'English',
            input.summary || null,
            input.coverImageUrl || null,
        ]
    );

    if (result.rows.length === 0) return null;
    return toBook(result.rows[0]);
}

export async function deleteBook(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(`DELETE FROM tracker.books WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
}

// ISBN management
export async function addIsbn(bookId: string, isbn: string, format?: string, notes?: string): Promise<BookIsbn> {
    const pool = getPool();
    try {
        const result = await pool.query(
            `INSERT INTO tracker.book_isbns (book_id, isbn, format, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id, book_id, isbn, format, notes`,
            [bookId, isbn, format || null, notes || null]
        );
        const row = result.rows[0];
        return { id: row.id, bookId: row.book_id, isbn: row.isbn, format: row.format, notes: row.notes };
    } catch (err: unknown) {
        if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
            throw new ApiError(`ISBN "${isbn}" is already assigned to another book.`, 409);
        }
        throw err;
    }
}

export async function removeIsbn(isbnId: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(`DELETE FROM tracker.book_isbns WHERE id = $1`, [isbnId]);
    return (result.rowCount ?? 0) > 0;
}
