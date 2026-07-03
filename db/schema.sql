-- ============================================================
-- Author Catalog Tracker — PostgreSQL Schema
-- Database: authcattkr
-- ============================================================

-- Connect to the database (run separately or via psql -d authcattkr)
-- \c authcattkr;

-- ============================================================
-- Drop everything and start fresh
-- ============================================================
DROP SCHEMA IF EXISTS tracker CASCADE;

-- ============================================================
-- Schema
-- ============================================================
CREATE SCHEMA tracker;

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Authors
-- ============================================================
CREATE TABLE tracker.authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pen_name VARCHAR(200) NOT NULL,
    specialty VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Organizations (for book promotion outreach)
-- ============================================================
CREATE TABLE tracker.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact TEXT,
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    reach TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Distributors
-- ============================================================
CREATE TABLE tracker.distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Books (print and ebook in one table)
-- ============================================================
CREATE TABLE tracker.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    author_id UUID NOT NULL REFERENCES tracker.authors(id) ON DELETE RESTRICT,
    publication_date DATE,
    language VARCHAR(50) DEFAULT 'English',
    summary TEXT,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Book ISBNs (1 book = 1 or more ISBNs)
-- ============================================================
CREATE TABLE tracker.book_isbns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES tracker.books(id) ON DELETE CASCADE,
    isbn VARCHAR(17) NOT NULL UNIQUE,
    format VARCHAR(20),  -- e.g. Print, eBook, Hardcover, Paperback, Audio
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Book ↔ Distributor (which distributor carries which book, and in what format)
-- ============================================================
CREATE TABLE tracker.book_distributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES tracker.books(id) ON DELETE CASCADE,
    distributor_id UUID NOT NULL REFERENCES tracker.distributors(id) ON DELETE CASCADE,
    format VARCHAR(20),  -- Print, eBook, Both
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Organization Contacts (outreach log — who you contacted,
-- what you sent, and how it went)
-- ============================================================
CREATE TABLE tracker.organization_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES tracker.organizations(id) ON DELETE CASCADE,
    book_id UUID REFERENCES tracker.books(id) ON DELETE SET NULL,

    -- Who you actually reached (may differ from organizations.contact,
    -- which can drift or represent a general/old contact)
    contact_name VARCHAR(255),
    contact_title VARCHAR(255),      -- e.g. "Chapter President", "Staff Worker"
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),

    -- What was sent
    format_sent VARCHAR(20),         -- eBook, Print, ARC
    delivery_method VARCHAR(100),    -- StoryOrigin link, email attachment, physical mail, hand-delivered
    template_used VARCHAR(100),      -- e.g. "Email 1 - Gift", "Email 2 - Follow-up", "Custom"

    -- Timeline
    date_sent DATE,
    follow_up_date DATE,
    follow_up_count INTEGER DEFAULT 0,

    -- Response
    response_received BOOLEAN DEFAULT FALSE,
    response_date DATE,
    response_type VARCHAR(50),       -- Positive, Negative, No Response, Referred Elsewhere, Bulk Order Placed
    response_notes TEXT,

    -- Outcome
    outcome VARCHAR(50),             -- Pending, Declined, Added to Reading List, Bulk Order, Event Booking, No Outcome
    bulk_order_qty INTEGER,
    next_action TEXT,

    -- Compliance
    opt_out BOOLEAN DEFAULT FALSE,   -- honor if contact asks to stop hearing from you

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_books_author ON tracker.books(author_id);
CREATE INDEX idx_books_title ON tracker.books(title);
CREATE INDEX idx_book_isbns_book ON tracker.book_isbns(book_id);
CREATE INDEX idx_book_distributors_book ON tracker.book_distributors(book_id);
CREATE INDEX idx_book_distributors_dist ON tracker.book_distributors(distributor_id);
CREATE INDEX idx_authors_pen_name ON tracker.authors(pen_name);
CREATE INDEX idx_org_contacts_org ON tracker.organization_contacts(organization_id);
CREATE INDEX idx_org_contacts_book ON tracker.organization_contacts(book_id);
CREATE INDEX idx_org_contacts_email ON tracker.organization_contacts(contact_email);
CREATE INDEX idx_org_contacts_date_sent ON tracker.organization_contacts(date_sent);
CREATE INDEX idx_org_contacts_followup ON tracker.organization_contacts(follow_up_date);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION tracker.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_authors_updated
    BEFORE UPDATE ON tracker.authors
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();

CREATE TRIGGER trg_distributors_updated
    BEFORE UPDATE ON tracker.distributors
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();

CREATE TRIGGER trg_organizations_updated
    BEFORE UPDATE ON tracker.organizations
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();

CREATE TRIGGER trg_books_updated
    BEFORE UPDATE ON tracker.books
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();

CREATE TRIGGER trg_organization_contacts_updated
    BEFORE UPDATE ON tracker.organization_contacts
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();

-- ============================================================
-- View: Distributions by author (books + distributors combined)
-- ============================================================
CREATE VIEW tracker.v_distributions AS
SELECT
    bd.id AS distribution_id,
    a.id AS author_id,
    a.pen_name AS author_name,
    b.id AS book_id,
    b.title AS book_title,
    d.id AS distributor_id,
    d.name AS distributor_name,
    bd.format,
    bd.notes,
    bd.created_at
FROM tracker.book_distributors bd
JOIN tracker.books b ON b.id = bd.book_id
JOIN tracker.authors a ON a.id = b.author_id
JOIN tracker.distributors d ON d.id = bd.distributor_id
ORDER BY a.pen_name, b.title, d.name;

-- ============================================================
-- View: Organization outreach (contacts + org + book + pen name combined)
-- ============================================================
CREATE VIEW tracker.v_organization_outreach AS
SELECT
    oc.id AS contact_id,
    o.id AS organization_id,
    o.name AS organization_name,
    oc.contact_name,
    oc.contact_title,
    oc.contact_email,
    b.id AS book_id,
    b.title AS book_title,
    a.pen_name AS author_name,
    oc.format_sent,
    oc.delivery_method,
    oc.template_used,
    oc.date_sent,
    oc.follow_up_date,
    oc.follow_up_count,
    oc.response_received,
    oc.response_type,
    oc.outcome,
    oc.bulk_order_qty,
    oc.next_action,
    oc.opt_out
FROM tracker.organization_contacts oc
JOIN tracker.organizations o ON o.id = oc.organization_id
LEFT JOIN tracker.books b ON b.id = oc.book_id
LEFT JOIN tracker.authors a ON a.id = b.author_id
ORDER BY oc.date_sent DESC NULLS LAST;