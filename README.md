# Campus Found — Frontend 🎒🔍

React 18 + Vite + Tailwind SPA for the **Campus Found** campus lost & found platform.
This repository contains **only the frontend** — it talks to a separately hosted backend
(Express + MongoDB + Socket.IO).

## Features

- Browse / search lost & found items with filters (type, category, location, status, date)
- Post lost/found items with photo uploads
- Possible-match alerts, notifications with unread badge
- Real-time private chat (Socket.IO) with image attachments
- User profiles, My Posts dashboard, admin panel

## Getting started

```bash
npm install
cp .env.example .env    # optional — see below
npm run dev             # Vite dev server on http://localhost:5173
```

The dev server proxies `/api`, `/uploads` and `/socket.io` to `http://localhost:5000`
(override the target with the `BACKEND_ORIGIN` env var).

## Environment

| Variable | When to set it |
|---|---|
| `VITE_API_URL` | **Only** when the backend runs on a different origin than the frontend (e.g. `https://campus-found-api.onrender.com`). Leave empty for same-origin deployments. Drives the REST API **and** Socket.IO. |
| `VITE_PORT` | Optional dev-server port (default 5173). |

## Deploy to Vercel

`vercel.json` is included — build `npm run build`, output `dist`, SPA rewrites so deep
links like `/items/123` survive a refresh.

1. Push/import this repo in Vercel (Root Directory = repo root).
2. Set env var `VITE_API_URL` to your backend's public URL.
3. On the backend, add the Vercel domain to `CLIENT_ORIGIN` (CORS + Socket.IO allowlist).

## Backend

The API lives in a separate repository/folder (`backend/`): Express + Mongoose +
Socket.IO, MongoDB Atlas. Login is mobile-number + password; JWT is returned as a
bearer token and also set as an httpOnly cookie.
