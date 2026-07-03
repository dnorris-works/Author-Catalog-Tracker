-- ============================================================
-- Migration: data-integrity fixes for an already-deployed DB
-- Run with: psql "$DATABASE_URL" -f db/migrate_data_integrity.sql
-- Safe to run without dropping/rebuilding the schema.
-- ============================================================

-- Before applying the UNIQUE constraint, check for existing duplicate
-- ISBNs — the ALTER below will fail if any are found:
--   SELECT isbn, COUNT(*) FROM tracker.book_isbns GROUP BY isbn HAVING COUNT(*) > 1;

ALTER TABLE tracker.book_isbns
    ADD CONSTRAINT book_isbns_isbn_key UNIQUE (isbn);

-- Stop deleting an author from silently cascading away all of their
-- books (and, transitively, those books' ISBNs and distributor links).
-- Books must be deleted or reassigned to another author first.
ALTER TABLE tracker.books
    DROP CONSTRAINT books_author_id_fkey,
    ADD CONSTRAINT books_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES tracker.authors(id) ON DELETE RESTRICT;
