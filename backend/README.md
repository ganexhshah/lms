# Vellum LMS API

Laravel 12 API for the Vellum barista LMS, running in Docker with PostgreSQL, Redis, Nginx, and Mailpit.

## Stack

| Service | Port | Purpose |
|---------|------|---------|
| API (Nginx) | http://localhost:8080 | Laravel JSON API |
| Postgres | 5432 | Primary database |
| Redis | 6379 | Cache, queue, sessions |
| Mailpit UI | http://localhost:8025 | Local email inbox |
| Mailpit SMTP | 1025 | SMTP for the app |

## Requirements

- Docker Desktop (running)
- Docker Compose v2

## Quick start

```bash
cd backend
cp .env.example .env
# APP_KEY is generated on first container boot if empty

docker compose up -d --build
```

Wait until containers are healthy, then:

```bash
curl http://localhost:8080/api/health
```

Expected:

```json
{"status":"ok","db":true,"redis":true,"app":"Vellum LMS"}
```

## Auth

Default admin (seeded on boot):

- Email: `admin@vellum.edu`
- Password: `password`

Login:

```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@vellum.edu\",\"password\":\"password\"}"
```

Use the returned token:

```bash
curl http://localhost:8080/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

Logout:

```bash
curl -X POST http://localhost:8080/api/auth/logout ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Artisan in Docker

```bash
docker compose exec app php artisan migrate
docker compose exec app php artisan db:seed
docker compose exec app php artisan tinker
```

After schema/seeder changes (admin-only seed — no demo LMS data), reset the database with:

```bash
docker compose exec app php artisan migrate:fresh --seed
```

This recreates tables and seeds only `admin@vellum.edu` / `password` plus default landing CMS content.

After changing `composer.json` / `composer.lock` (vendor lives in a Docker volume for speed on Windows):

```bash
docker compose exec app composer install
```

After changing routes:

```bash
docker compose exec app php artisan route:cache
```

## Frontend CORS

`FRONTEND_URL` defaults to `http://localhost:3000`. API routes under `/api/*` allow that origin with Bearer tokens (Sanctum personal access tokens).

## Cloudflare R2 CDN

Uploads go to the `lms` R2 bucket (`FILESYSTEM_DISK=s3`). Public files are served from `AWS_URL` (r2.dev or a custom domain).

```bash
# generic upload
POST /api/uploads  (multipart: file, optional folder)  → { data: { url, path, ... } }

# student photo
PATCH /api/students/{id}/photo  (multipart: photo) or JSON { photoUrl }
```

Set CORS on the bucket in Cloudflare for your frontend origin (`http://localhost:3000`).

## Canva Connect (ID cards + certificates)

Uses [Canva Connect Autofill](https://www.canva.dev/docs/connect/autofill-guide/) with Brand Templates.

**Requirements**
- Canva Developer integration (Client ID + Secret)
- Redirect URI: `http://127.0.0.1:8080/api/canva/callback` (Canva rejects `localhost` — use `127.0.0.1`)
- Brand Templates for ID card + certificate with autofill fields
- Canva Enterprise for production autofill (paid plans get a limited trial while developing)

**Setup**
1. Create templates in Canva Brand Kit with data fields named like `student_name`, `student_code`, `course`, `batch`, `blood_group`, `issued_at`, `certificate_number`, `school_name` (or map names in `.env`).
2. Put Client ID/Secret + template IDs in `backend/.env`.
3. In the app: Certificates → **Connect Canva**, then generate; or Student → ID Card → **Generate with Canva**.

```bash
POST /api/canva/connect
POST /api/canva/id-cards/{studentId}
POST /api/canva/certificates  { studentId, course }
```

## Useful commands

```bash
docker compose ps
docker compose logs -f app
docker compose down
docker compose down -v   # also wipe Postgres/Redis volumes
```

## Next steps

Domain APIs (students, admissions, courses, batches, …) will be added in a follow-up phase to replace the frontend Zustand mocks.
