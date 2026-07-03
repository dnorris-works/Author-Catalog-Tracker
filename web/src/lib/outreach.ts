import { getPool } from './db';

export type OutreachView = {
    contactId: string;
    organizationId: string;
    organizationName: string;
    contactName: string | null;
    contactTitle: string | null;
    contactEmail: string | null;
    bookId: string | null;
    bookTitle: string | null;
    authorName: string | null;
    formatSent: string | null;
    deliveryMethod: string | null;
    templateUsed: string | null;
    dateSent: string | null;
    followUpDate: string | null;
    followUpCount: number;
    responseReceived: boolean;
    responseType: string | null;
    outcome: string | null;
    bulkOrderQty: number | null;
    nextAction: string | null;
    optOut: boolean;
};

export type OutreachInput = {
    organizationId: string;
    bookId?: string;
    contactName?: string;
    contactTitle?: string;
    contactEmail?: string;
    contactPhone?: string;
    formatSent?: string;
    deliveryMethod?: string;
    templateUsed?: string;
    dateSent?: string;
    followUpDate?: string;
    followUpCount?: number;
    responseReceived?: boolean;
    responseDate?: string;
    responseType?: string;
    responseNotes?: string;
    outcome?: string;
    bulkOrderQty?: number;
    nextAction?: string;
    optOut?: boolean;
};

export async function getAllOutreach(): Promise<OutreachView[]> {
    if (!process.env.DATABASE_URL) return [];

    const pool = getPool();
    const result = await pool.query(
        `SELECT contact_id, organization_id, organization_name,
                contact_name, contact_title, contact_email,
                book_id, book_title, author_name,
                format_sent, delivery_method, template_used,
                date_sent, follow_up_date, follow_up_count,
                response_received, response_type,
                outcome, bulk_order_qty, next_action, opt_out
         FROM tracker.v_organization_outreach`
    );

    return result.rows.map(toOutreachView);
}

export async function getOutreachById(id: string): Promise<OutreachView | null> {
    if (!process.env.DATABASE_URL) return null;

    const pool = getPool();
    const result = await pool.query(
        `SELECT contact_id, organization_id, organization_name,
                contact_name, contact_title, contact_email,
                book_id, book_title, author_name,
                format_sent, delivery_method, template_used,
                date_sent, follow_up_date, follow_up_count,
                response_received, response_type,
                outcome, bulk_order_qty, next_action, opt_out
         FROM tracker.v_organization_outreach
         WHERE contact_id = $1`,
        [id]
    );

    if (result.rows.length === 0) return null;
    return toOutreachView(result.rows[0]);
}

export async function createOutreach(input: OutreachInput): Promise<string> {
    const pool = getPool();
    const result = await pool.query(
        `INSERT INTO tracker.organization_contacts
            (organization_id, book_id, contact_name, contact_title, contact_email, contact_phone,
             format_sent, delivery_method, template_used,
             date_sent, follow_up_date, follow_up_count,
             response_received, response_date, response_type, response_notes,
             outcome, bulk_order_qty, next_action, opt_out)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         RETURNING id`,
        [
            input.organizationId,
            input.bookId || null,
            input.contactName || null,
            input.contactTitle || null,
            input.contactEmail || null,
            input.contactPhone || null,
            input.formatSent || null,
            input.deliveryMethod || null,
            input.templateUsed || null,
            input.dateSent || null,
            input.followUpDate || null,
            input.followUpCount ?? 0,
            input.responseReceived ?? false,
            input.responseDate || null,
            input.responseType || null,
            input.responseNotes || null,
            input.outcome || null,
            input.bulkOrderQty || null,
            input.nextAction || null,
            input.optOut ?? false,
        ]
    );

    return result.rows[0].id;
}

export async function updateOutreach(id: string, input: OutreachInput): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `UPDATE tracker.organization_contacts
         SET organization_id = $2, book_id = $3, contact_name = $4, contact_title = $5,
             contact_email = $6, contact_phone = $7, format_sent = $8, delivery_method = $9,
             template_used = $10, date_sent = $11, follow_up_date = $12, follow_up_count = $13,
             response_received = $14, response_date = $15, response_type = $16, response_notes = $17,
             outcome = $18, bulk_order_qty = $19, next_action = $20, opt_out = $21
         WHERE id = $1`,
        [
            id,
            input.organizationId,
            input.bookId || null,
            input.contactName || null,
            input.contactTitle || null,
            input.contactEmail || null,
            input.contactPhone || null,
            input.formatSent || null,
            input.deliveryMethod || null,
            input.templateUsed || null,
            input.dateSent || null,
            input.followUpDate || null,
            input.followUpCount ?? 0,
            input.responseReceived ?? false,
            input.responseDate || null,
            input.responseType || null,
            input.responseNotes || null,
            input.outcome || null,
            input.bulkOrderQty || null,
            input.nextAction || null,
            input.optOut ?? false,
        ]
    );

    return (result.rowCount ?? 0) > 0;
}

export async function deleteOutreach(id: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
        `DELETE FROM tracker.organization_contacts WHERE id = $1`,
        [id]
    );
    return (result.rowCount ?? 0) > 0;
}

function toOutreachView(row: Record<string, unknown>): OutreachView {
    return {
        contactId: row.contact_id as string,
        organizationId: row.organization_id as string,
        organizationName: row.organization_name as string,
        contactName: row.contact_name as string | null,
        contactTitle: row.contact_title as string | null,
        contactEmail: row.contact_email as string | null,
        bookId: row.book_id as string | null,
        bookTitle: row.book_title as string | null,
        authorName: row.author_name as string | null,
        formatSent: row.format_sent as string | null,
        deliveryMethod: row.delivery_method as string | null,
        templateUsed: row.template_used as string | null,
        dateSent: row.date_sent as string | null,
        followUpDate: row.follow_up_date as string | null,
        followUpCount: (row.follow_up_count as number) ?? 0,
        responseReceived: (row.response_received as boolean) ?? false,
        responseType: row.response_type as string | null,
        outcome: row.outcome as string | null,
        bulkOrderQty: row.bulk_order_qty as number | null,
        nextAction: row.next_action as string | null,
        optOut: (row.opt_out as boolean) ?? false,
    };
}
