-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: mangas
create table if not exists public.mangas (
    id uuid default uuid_generate_v4() primary key,
    source_id varchar not null unique,
    title varchar not null,
    alternative_title varchar,
    description text,
    cover varchar,
    thumbnail varchar,
    status varchar,
    rating decimal(3, 1),
    views integer default 0,
    bookmarks integer default 0,
    release_year varchar,
    type varchar,
    format varchar,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: chapters
create table if not exists public.chapters (
    id uuid default uuid_generate_v4() primary key,
    manga_id uuid references public.mangas(id) on delete cascade not null,
    source_chapter_id varchar not null unique,
    chapter_number decimal(10, 2),
    title varchar,
    release_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table: genres
create table if not exists public.genres (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null unique,
    slug varchar not null unique
);

-- Table: manga_genres
create table if not exists public.manga_genres (
    manga_id uuid references public.mangas(id) on delete cascade not null,
    genre_id uuid references public.genres(id) on delete cascade not null,
    primary key (manga_id, genre_id)
);

-- Table: authors
create table if not exists public.authors (
    id uuid default uuid_generate_v4() primary key,
    name varchar not null unique,
    slug varchar not null unique
);

-- Table: comments
create table if not exists public.comments (
    id uuid default uuid_generate_v4() primary key,
    chapter_id varchar not null,
    user_name varchar(50) not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
create index if not exists idx_comments_chapter_id on public.comments(chapter_id);

-- Table: manga_authors
create table if not exists public.manga_authors (
    manga_id uuid references public.mangas(id) on delete cascade not null,
    author_id uuid references public.authors(id) on delete cascade not null,
    primary key (manga_id, author_id)
);

-- Indexes for performance
create index if not exists idx_mangas_source_id on public.mangas(source_id);
create index if not exists idx_chapters_manga_id on public.chapters(manga_id);
create index if not exists idx_chapters_source_chapter_id on public.chapters(source_chapter_id);

-- Disable RLS temporarily for scraping (or create policies if you use anon key)
alter table public.mangas disable row level security;
alter table public.chapters disable row level security;
alter table public.comments disable row level security;
alter table public.genres disable row level security;
alter table public.manga_genres disable row level security;
alter table public.authors disable row level security;
alter table public.manga_authors disable row level security;
