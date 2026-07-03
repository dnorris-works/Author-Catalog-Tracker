import { getPool } from './db';

export type Book = {
    id: string;
    title: string;
    subtitle: string | null;
    isbn10: string | null;
    isbn13: string | null;
    authorId: string;
    distributorId: string | null;
    publicationDate: string | null;
    edition: string | null;
    pageCount: number | null;
    language: string;
    summary: string | null;
    coverImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type BookRow = {
    id: string;
    title: string;
    subtitle: string | null;
    isbn_10: string | null;
    isbn_13: string | null;
    author_id: string;
    distributor_id: string | null;
    publication_date: string | null;
    edition: string | null;
    page_count: number | null;
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
        isbn10: row.isbn_10,
        isbn13: row.isbn_13,
        authorId: row.author_id,
        distributorId: row.distributor_id,
        publicationDate: row.publication_date,
        edition: row.edition,
        pageCount: row.page_count,
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
    const result = await pool.query(
        `SELECT id, title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
                publication_date, edition, page_count, language, summary, cover_image_url,
                created_at, updated_at
         FROM tracker.books
         ORDER BY title ASC`
    );

    return result.rows.map(toBook);
}

export async function getBooksByAuthor(authorId: string): Promise<Book[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
                publication_date, edition, page_count, language, summary, cover_image_url,
                created_at, updated_at
         FROM tracker.books
         WHERE author_id = $1
         ORDER BY publication_date DESC NULLS LAST, title ASC`,
        [authorId]
    );

    return result.rows.map(toBook);
}

export async function getBookById(id: string): Promise<Book | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
                publication_date, edition, page_count, language, summary, cover_image_url,
                created_at, updated_at
         FROM tracker.books
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toBook(result.rows[0]);
}

export async function createBook(input: {
    title: string;
    subtitle?: string;
    isbn10?: string;
    isbn13?: string;
    authorId: string;
    distributorId?: string;
    publicationDate?: string;
    edition?: string;
    pageCount?: number;
    language?: string;
    summary?: string;
    coverImageUrl?: string;
}): Promise<Book> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.books
            (title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
             publication_date, edition, page_count, language, summary, cover_image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id, title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
                   publication_date, edition, page_count, language, summary, cover_image_url,
                   created_at, updated_at`,
        [
            input.title,
            input.subtitle || null,
            input.isbn10 || null,
            input.isbn13 || null,
            input.authorId,
            input.distributorId || null,
            input.publicationDate || null,
            input.edition || null,
            input.pageCount || null,
            input.language || 'English',
            input.summary || null,
            input.coverImageUrl || null,
        ]
    );

    return toBook(result.rows[0]);
}

export async function updateBook(
    id: string,
    input: {
        title: string;
        subtitle?: string;
        isbn10?: string;
        isbn13?: string;
        authorId: string;
        distributorId?: string;
        publicationDate?: string;
        edition?: string;
        pageCount?: number;
        language?: string;
        summary?: string;
        coverImageUrl?: string;
    }
): Promise<Book | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.books
         SET title = $2, subtitle = $3, isbn_10 = $4, isbn_13 = $5, author_id = $6,
             distributor_id = $7, publication_date = $8, edition = $9, page_count = $10,
             language = $11, summary = $12, cover_image_url = $13
         WHERE id = $1
         RETURNING id, title, subtitle, isbn_10, isbn_13, author_id, distributor_id,
                   publication_date, edition, page_count, language, summary, cover_image_url,
                   created_at, updated_at`,
        [
            id,
            input.title,
            input.subtitle || null,
            input.isbn10 || null,
            input.isbn13 || null,
            input.authorId,
            input.distributorId || null,
            input.publicationDate || null,
            input.edition || null,
            input.pageCount || null,
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
    const result = await pool.query(
        `DELETE FROM tracker.books WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}
