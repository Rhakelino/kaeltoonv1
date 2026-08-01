# Kaeltoon API Documentation

**Base URL:** `https://kaeltoon-api.instanclay.workers.dev`

All endpoints return a standardized JSON wrapper:
```json
{
  "status": "success", // or "error"
  "data": { ... }, // The requested payload
  "pagination": { ... } // (Optional) Pagination details
}
```

---

## 1. GET `/home`
Returns a combined payload of recommended, popular, and latest manga for the homepage slider/sections.

**Response:**
```json
{
  "status": "success",
  "data": {
    "recommended": [ { "id": "uuid", "title": "...", "cover": "...", ... } ],
    "popular": [ { "id": "uuid", "title": "...", "views": 1000, ... } ],
    "latest": [ { "id": "uuid", "title": "...", "updated_at": "...", ... } ]
  }
}
```

---

## 2. GET `/popular`
Returns a paginated list of manga ordered by views (descending).

**Query Parameters:**
- `page` (optional): Page number, defaults to 1. (Page size is fixed at 20).

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "title": "...", "views": 99999, ... }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 50,
    "page_size": 20
  }
}
```

---

## 3. GET `/latest`
Returns a paginated list of manga ordered by `updated_at` (descending) representing the latest releases.

**Query Parameters:**
- `page` (optional): Page number, defaults to 1. (Page size is fixed at 20).

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "title": "...", "updated_at": "...", ... }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 50,
    "page_size": 20
  }
}
```

---

## 4. GET `/recommended`
Returns a paginated list of recommended manga (currently standard ordered, limited to 20 per page).

**Query Parameters:**
- `page` (optional): Page number, defaults to 1.

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "title": "...", ... }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 50,
    "page_size": 20
  }
}
```

---

## 5. GET `/manga/:id`
Retrieves detailed information for a specific manga, including joined relationships for genres and authors.

**Path Parameters:**
- `id`: The UUID of the manga in Supabase.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "cover": "...",
    "manga_genres": [ { "genres": { "id": 1, "name": "Action" } } ],
    "manga_authors": [ { "authors": { "id": 1, "name": "Author Name" } } ]
  }
}
```

---

## 6. GET `/chapters/:manga_id`
Returns a paginated list of chapters for a specific manga, ordered by `chapter_number` descending.

**Path Parameters:**
- `manga_id`: The UUID of the manga.

**Query Parameters:**
- `page` (optional): Page number, defaults to 1. (Page size is fixed at 50).

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "manga_id": "uuid",
      "chapter_number": 100,
      "source_chapter_id": "...",
      ...
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "page_size": 50
  }
}
```

---

## 7. GET `/search`
Searches for manga by title or alternative title using case-insensitive partial matching (`ilike`).

**Query Parameters:**
- `q` (required): The search keyword.
- `page` (optional): Page number, defaults to 1. (Page size is fixed at 20).

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": "uuid", "title": "Solo Leveling", "alternative_title": "...", ... }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "page_size": 20
  }
}
```

---

## 8. GET `/genres`
Returns a list of all available genres sorted alphabetically.

**Response:**
```json
{
  "status": "success",
  "data": [
    { "id": 1, "name": "Action", "slug": "action" },
    { "id": 2, "name": "Adventure", "slug": "adventure" }
  ]
}
```

---

## 9. GET `/read/:chapter_id`
A proxy endpoint that dynamically fetches the array of image URLs for a specific chapter from the external source (Sanka/Shinigami API).

**Path Parameters:**
- `chapter_id`: The UUID of the chapter in Supabase (NOT the `source_chapter_id`).

**Response:**
```json
{
  "status": "success",
  "data": [
    "https://assets.shngm.id/chapter/.../1.jpg",
    "https://assets.shngm.id/chapter/.../2.jpg"
  ]
}
```