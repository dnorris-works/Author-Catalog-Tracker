import { getPool } from './db';

export type Organization = {
    id: string;
    name: string;
    contact: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    reach: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type OrganizationRow = {
    id: string;
    name: string;
    contact: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    reach: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
};

function toOrganization(row: OrganizationRow): Organization {
    return {
        id: row.id,
        name: row.name,
        contact: row.contact,
        email: row.email,
        phone: row.phone,
        website: row.website,
        reach: row.reach,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getAllOrganizations(): Promise<Organization[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, name, contact, email, phone, website, reach, notes, created_at, updated_at
         FROM tracker.organizations
         ORDER BY name ASC`
    );

    return result.rows.map(toOrganization);
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT id, name, contact, email, phone, website, reach, notes, created_at, updated_at
         FROM tracker.organizations
         WHERE id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toOrganization(result.rows[0]);
}

export async function createOrganization(input: {
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    website?: string;
    reach?: string;
    notes?: string;
}): Promise<Organization> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.organizations (name, contact, email, phone, website, reach, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, contact, email, phone, website, reach, notes, created_at, updated_at`,
        [
            input.name,
            input.contact || null,
            input.email || null,
            input.phone || null,
            input.website || null,
            input.reach || null,
            input.notes || null,
        ]
    );

    return toOrganization(result.rows[0]);
}

export async function updateOrganization(
    id: string,
    input: {
        name: string;
        contact?: string;
        email?: string;
        phone?: string;
        website?: string;
        reach?: string;
        notes?: string;
    }
): Promise<Organization | null> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.organizations
         SET name = $2, contact = $3, email = $4, phone = $5, website = $6, reach = $7, notes = $8
         WHERE id = $1
         RETURNING id, name, contact, email, phone, website, reach, notes, created_at, updated_at`,
        [
            id,
            input.name,
            input.contact || null,
            input.email || null,
            input.phone || null,
            input.website || null,
            input.reach || null,
            input.notes || null,
        ]
    );

    if (result.rows.length === 0) return null;
    return toOrganization(result.rows[0]);
}

export async function deleteOrganization(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `DELETE FROM tracker.organizations WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}
