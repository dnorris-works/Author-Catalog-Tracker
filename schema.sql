-- ============================================================
-- Author Catalog Tracker — PostgreSQL Schema
-- Database: authcattkr
-- ============================================================

-- Connect to the database (run separately or via psql -d authcattkr)
-- \c authcattkr;

-- ============================================================
-- Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS tracker;

-- Set search path so all objects are created inside the tracker schema
SET search_path TO tracker, public;

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Authors
-- ============================================================
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    pen_name VARCHAR(200),
    bio TEXT,
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Publishers
-- ============================================================
CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
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
CREATE TABLE IF NOT EXISTS genres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- ============================================================
-- Books
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    isbn_10 CHAR(10),
    isbn_13 CHAR(13),
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS ebooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL UNIQUE REFERENCES books(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS book_genres (
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    genre_id UUID NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_publisher ON books(publisher_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_ebooks_book ON ebooks(book_id);
CREATE INDEX IF NOT EXISTS idx_authors_last_name ON authors(last_name);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_authors_updated
    BEFORE UPDATE ON authors
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_publishers_updated
    BEFORE UPDATE ON publishers
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_books_updated
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trg_ebooks_updated
    BEFORE UPDATE ON ebooks
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
