import { getPool } from './db';

export type Distribution = {
    id: string;
    bookId: string;
    distributorId: string;
    format: string | null;
    notes: string | null;
    createdAt: Date;
};

export type DistributionView = {
    id: string;
    bookId: string;
    bookTitle: string;
    distributorId: string;
    distributorName: string;
    format: string | null;
    notes: string | null;
};

export async function getDistributionsByAuthor(authorId: string): Promise<DistributionView[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT distribution_id, book_id, book_title,
                distributor_id, distributor_name,
                format, notes
         FROM tracker.v_distributions
         WHERE author_id = $1`,
        [authorId]
    );

    return result.rows.map((row) => ({
        id: row.distribution_id,
        bookId: row.book_id,
        bookTitle: row.book_title,
        distributorId: row.distributor_id,
        distributorName: row.distributor_name,
        format: row.format,
        notes: row.notes,
    }));
}

export async function createDistribution(input: {
    bookId: string;
    distributorId: string;
    format?: string;
    notes?: string;
}): Promise<Distribution> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.book_distributors (book_id, distributor_id, format, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id, book_id, distributor_id, format, notes, created_at`,
        [input.bookId, input.distributorId, input.format || null, input.notes || null]
    );

    const row = result.rows[0];
    return {
        id: row.id,
        bookId: row.book_id,
        distributorId: row.distributor_id,
        format: row.format,
        notes: row.notes,
        createdAt: row.created_at,
    };
}

export async function deleteDistribution(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `DELETE FROM tracker.book_distributors WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}
