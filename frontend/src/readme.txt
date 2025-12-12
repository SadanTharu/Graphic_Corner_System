# Client Platform (Public site + Client & Admin dashboards)


This repo contains a backend (Node/Express/MongoDB) and a frontend (React + Vite + Tailwind).


## Quick start (local)


1. Clone repository and `cd client-platform/backend`
2. Copy `.env.example` to `.env` and fill values (MONGO_URI, JWT_SECRET, ADMIN_PASSWORD)
3. `npm install` then `npm run dev` (backend runs on port 4000)


4. In another terminal `cd ../frontend`
5. `npm install` then `npm run dev` (frontend runs on port 5173)


6. Browse to `http://localhost:5173`


## Deployment


- Use MongoDB Atlas free tier and copy MONGO_URI.
- Deploy backend to Render or Railway (set environment variables).
- Deploy frontend to Vercel and set `VITE_API_URL` to your backend base URL.


## Notes


- Use `/api/auth/seed-admin` to create an admin (POST with `{ "adminKey": "<ADMIN_PASSWORD>" }`).
- Create client accounts through admin panel (or seed via scripts).