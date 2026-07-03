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
-- Genres
-- ============================================================
CREATE TABLE tracker.genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================================
-- Books
-- ============================================================
CREATE TABLE tracker.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    isbn_10 CHAR(10),
    isbn_13 CHAR(13),
    author_id UUID NOT NULL REFERENCES tracker.authors(id) ON DELETE CASCADE,
    distributor_id UUID REFERENCES tracker.distributors(id) ON DELETE SET NULL,
    publication_date DATE,
    edition VARCHAR(50),
    page_count INTEGER,
    language VARCHAR(50) DEFAULT 'English',
    summary TEXT,
    cover_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- eBooks (extends a book with digital-specific metadata)
-- ============================================================
CREATE TABLE tracker.ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL UNIQUE REFERENCES tracker.books(id) ON DELETE CASCADE,
    file_format VARCHAR(20) NOT NULL,  -- e.g. EPUB, PDF, MOBI, AZW3
    file_size_bytes BIGINT,
    drm_protected BOOLEAN DEFAULT FALSE,
    download_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Book ↔ Genre (many-to-many)
-- ============================================================
CREATE TABLE tracker.book_genres (
    book_id UUID NOT NULL REFERENCES tracker.books(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES tracker.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_books_author ON tracker.books(author_id);
CREATE INDEX idx_books_distributor ON tracker.books(distributor_id);
CREATE INDEX idx_books_title ON tracker.books(title);
CREATE INDEX idx_ebooks_book ON tracker.ebooks(book_id);
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

CREATE TRIGGER trg_ebooks_updated
    BEFORE UPDATE ON tracker.ebooks
    FOR EACH ROW EXECUTE FUNCTION tracker.update_modified_column();
