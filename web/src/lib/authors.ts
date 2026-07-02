import { getPool } from './db';

export type Author = {
    id: string;
    penName: string;
    specialty: string | null;
    website: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type AuthorRow = {
    id: string;
    pen_name: string;
    specialty: string | null;
    website: string | null;
    created_at: Date;
    updated_at: Date;
};

function toAuthor(row: AuthorRow): Author {
    return {
        id: row.id,
        penName: row.pen_name,
        specialty: row.specialty,
        website: row.website,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getAllAuthors(): Promise<Author[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, pen_name, specialty, website, created_at, updated_at
         FROM tracker.authors
         ORDER BY pen_name ASC`
    );

    return result.rows.map(toAuthor);
}

export async function getAuthorById(id: string): Promise<Author | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, pen_name, specialty, website, created_at, updated_at
         FROM tracker.authors
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toAuthor(result.rows[0]);
}

export async function createAuthor(input: {
    penName: string;
    specialty?: string;
    website?: string;
}): Promise<Author> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.authors (pen_name, specialty, website)
         VALUES ($1, $2, $3)
         RETURNING id, pen_name, specialty, website, created_at, updated_at`,
        [
            input.penName,
            input.specialty || null,
            input.website || null,
        ]
    );

    return toAuthor(result.rows[0]);
}

export async function updateAuthor(
    id: string,
    input: {
        penName: string;
        specialty?: string;
        website?: string;
    }
): Promise<Author | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.authors
         SET pen_name = $2, specialty = $3, website = $4
         WHERE id = $1
         RETURNING id, pen_name, specialty, website, created_at, updated_at`,
        [
            id,
            input.penName,
            input.specialty || null,
            input.website || null,
        ]
    );

    if (result.rows.length === 0) return null;
    return toAuthor(result.rows[0]);
}

export async function deleteAuthor(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `DELETE FROM tracker.authors WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}
