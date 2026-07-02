import { getPool } from './db';

export type Author = {
    id: string;
    firstName: string;
    lastName: string;
    penName: string | null;
    bio: string | null;
    email: string | null;
    website: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type AuthorRow = {
    id: string;
    first_name: string;
    last_name: string;
    pen_name: string | null;
    bio: string | null;
    email: string | null;
    website: string | null;
    created_at: Date;
    updated_at: Date;
};

function toAuthor(row: AuthorRow): Author {
    return {
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        penName: row.pen_name,
        bio: row.bio,
        email: row.email,
        website: row.website,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getAllAuthors(): Promise<Author[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, first_name, last_name, pen_name, bio, email, website, created_at, updated_at
         FROM tracker.authors
         ORDER BY last_name ASC, first_name ASC`
    );

    return result.rows.map(toAuthor);
}

export async function getAuthorById(id: string): Promise<Author | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, first_name, last_name, pen_name, bio, email, website, created_at, updated_at
         FROM tracker.authors
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toAuthor(result.rows[0]);
}

export async function createAuthor(input: {
    firstName: string;
    lastName: string;
    penName?: string;
    bio?: string;
    email?: string;
    website?: string;
}): Promise<Author> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.authors (first_name, last_name, pen_name, bio, email, website)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, first_name, last_name, pen_name, bio, email, website, created_at, updated_at`,
        [
            input.firstName,
            input.lastName,
            input.penName || null,
            input.bio || null,
            input.email || null,
            input.website || null,
        ]
    );

    return toAuthor(result.rows[0]);
}

export async function updateAuthor(
    id: string,
    input: {
        firstName: string;
        lastName: string;
        penName?: string;
        bio?: string;
        email?: string;
        website?: string;
    }
): Promise<Author | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.authors
         SET first_name = $2, last_name = $3, pen_name = $4, bio = $5, email = $6, website = $7
         WHERE id = $1
         RETURNING id, first_name, last_name, pen_name, bio, email, website, created_at, updated_at`,
        [
            id,
            input.firstName,
            input.lastName,
            input.penName || null,
            input.bio || null,
            input.email || null,
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
