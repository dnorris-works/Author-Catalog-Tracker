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
    author_id UUID NOT NULL REFERENCES tracker.authors(id) ON DELETE CASCADE,
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
    isbn VARCHAR(17) NOT NULL,
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
-- Indexes
-- ============================================================
CREATE INDEX idx_books_author ON tracker.books(author_id);
CREATE INDEX idx_books_title ON tracker.books(title);
CREATE INDEX idx_book_isbns_book ON tracker.book_isbns(book_id);
CREATE INDEX idx_book_distributors_book ON tracker.book_distributors(book_id);
CREATE INDEX idx_book_distributors_dist ON tracker.book_distributors(distributor_id);
CREATE INDEX idx_authors_pen_name ON tracker.authors(pen_name);

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
