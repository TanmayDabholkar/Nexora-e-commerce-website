V# Nexora storefront

A recruiter-friendly e-commerce portfolio project: a responsive vanilla HTML/CSS/JavaScript storefront, Vercel serverless APIs, and Postgres-backed account registration.

## Architecture

- `homepage/` — storefront source, product detail page, and local Node/SQLite development server.
- `login-page/` — sign-in and create-account interface.
- `api/` — Vercel Functions. `products.js` returns the read-only catalogue; `register.js` and `login.js` use managed Postgres.
- `scripts/prepare-vercel.js` — copies browser files to `public/` for deployment and generates the product API catalogue.

The local SQLite databases are intentionally excluded from deployment: serverless filesystems are temporary. Production accounts are stored in Postgres through `DATABASE_URL`.

## Run locally

```bash
node homepage/server.js
```

Open `http://localhost:3001`. This uses the local SQLite demo database.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository at Vercel and leave the framework preset as **Other**.
3. In Vercel Marketplace, add a Postgres provider such as Neon and copy its pooled `DATABASE_URL` to the project environment variables.
4. Deploy. Vercel runs `npm run build`, hosts `public/`, and exposes `api/` as serverless endpoints.

Never commit `.env` files or database files. For an actual production store, add email verification, sessions, password-reset tokens, rate limiting, and a payment provider.
