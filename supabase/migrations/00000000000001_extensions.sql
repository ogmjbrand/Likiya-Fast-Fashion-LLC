-- Extensions required across the schema.
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";       -- fuzzy / partial text search
create extension if not exists "unaccent";      -- accent-insensitive search
create extension if not exists "citext";        -- case-insensitive email/code columns
