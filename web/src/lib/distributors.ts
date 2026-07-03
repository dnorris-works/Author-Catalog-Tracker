import { getPool } from './db';

export type Distributor = {
    id: string;
    name: string;
    contact: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type DistributorRow = {
    id: string;
    name: string;
    contact: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    created_at: Date;
    updated_at: Date;
};

function toDistributor(row: DistributorRow): Distributor {
    return {
        id: row.id,
        name: row.name,
        contact: row.contact,
        website: row.website,
        email: row.email,
        phone: row.phone,
        address: row.address,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getAllDistributors(): Promise<Distributor[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, name, contact, website, email, phone, address, created_at, updated_at
         FROM tracker.distributors
         ORDER BY name ASC`
    );

    return result.rows.map(toDistributor);
}

export async function getDistributorById(id: string): Promise<Distributor | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, name, contact, website, email, phone, address, created_at, updated_at
         FROM tracker.distributors
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toDistributor(result.rows[0]);
}

export async function createDistributor(input: {
    name: string;
    contact?: string;
    website?: string;
    email?: string;
    phone?: string;
    address?: string;
}): Promise<Distributor> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.distributors (name, contact, website, email, phone, address)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, contact, website, email, phone, address, created_at, updated_at`,
        [
            input.name,
            input.contact || null,
            input.website || null,
            input.email || null,
            input.phone || null,
            input.address || null,
        ]
    );

    return toDistributor(result.rows[0]);
}

export async function updateDistributor(
    id: string,
    input: {
        name: string;
        contact?: string;
        website?: string;
        email?: string;
        phone?: string;
        address?: string;
    }
): Promise<Distributor | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.distributors
         SET name = $2, contact = $3, website = $4, email = $5, phone = $6, address = $7
         WHERE id = $1
         RETURNING id, name, contact, website, email, phone, address, created_at, updated_at`,
        [
            id,
            input.name,
            input.contact || null,
            input.website || null,
            input.email || null,
            input.phone || null,
            input.address || null,
        ]
    );

    if (result.rows.length === 0) return null;
    return toDistributor(result.rows[0]);
}

export async function deleteDistributor(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `DELETE FROM tracker.distributors WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}
