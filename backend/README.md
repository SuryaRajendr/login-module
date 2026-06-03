# FastAPI Backend

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Create the MySQL database:

```sql
CREATE DATABASE login_module;
```

Or run:

```bash
mysql -u root -p < sql/schema.sql
```

Run the API:

```bash
uvicorn app.main:app --reload --port 8000
```

The `users` table is created automatically on startup.

## First Milestone APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/health`

Login expects the frontend to send a mobile number after OTP verification.
