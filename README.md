# To-DO-List – To-Do App with User Management & RBAC

A full-stack to-do application built with **React + TypeScript (Vite)** on the front end and **Node.js + Express + TypeScript** on the back end, using **PostgreSQL (Prisma)** for persistence.

- **Live app:** `<add your deployed URL>`
- **API:** `<add your deployed API URL>`

## Demo credentials

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@gmail.com   | Admin@123  |
| User  | user@gmail.com    | User@123   |

## Features

**Tasks**
- Home page lists tasks (name, status, priority); Add Task page with name + status (+ priority)
- Mark complete / incomplete, edit, delete
- Bonus: search by name, filter by status and priority, sort by name or status (newest first by default), pagination
- Optional due dates, a stats bar (total, completed, pending, progress), and toast notifications
- Search, filters, sort and page are kept in the URL, so views can be refreshed and shared
- Responsive layout (mobile → desktop), plain CSS

**Users & RBAC**
- JWT authentication (bcrypt-hashed passwords), protected API routes and protected React routes
- **Admin:** view / create / edit / delete users, change roles, view all tasks (read-only)
- **User:** view, create, edit, delete and complete only their own tasks
- Admins cannot create, edit or delete tasks, and cannot delete themselves or change their own role
- Roles are re-read from the database on every request, so role changes and deletions take effect immediately

## Tech stack
React 19, React Router, Vite, TypeScript · Express 5, Prisma 6, PostgreSQL, Zod, JWT, bcryptjs

## Run locally

Prerequisites: Node 20+, a PostgreSQL database (local, or a free one from Neon / Supabase).

```bash
# 1. Backend
cd server
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npm run db:push             # creates the tables
npm run seed                # creates the demo admin + user
npm run dev                 # http://localhost:4000

# 2. Frontend (new terminal)
cd client
cp .env.example .env        # VITE_API_URL=http://localhost:4000/api
npm install
npm run dev                 # http://localhost:5173
```

### Environment variables

| File | Variable | Description |
|------|----------|-------------|
| server/.env | `DATABASE_URL` | PostgreSQL connection string |
| server/.env | `JWT_SECRET` | Long random string used to sign tokens |
| server/.env | `CLIENT_URL` | Allowed CORS origin(s); comma-separated for several |
| server/.env | `PORT` | API port (default 4000) |
| client/.env | `VITE_API_URL` | Base URL of the API, including `/api` |

## API overview

| Method | Route | Access |
|--------|-------|--------|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/tasks/stats?today` | Authenticated (admin: all tasks, user: own) |
| GET | `/api/tasks?page&limit&status&priority&due&search&sort&order&today` | Authenticated (admin sees all tasks, user sees own) |
| POST | `/api/tasks` | User only |
| PATCH / DELETE | `/api/tasks/:id` | User only, own tasks |
| GET / POST | `/api/users` | Admin |
| PATCH / DELETE | `/api/users/:id` | Admin |

## Project structure

```
server/  prisma/schema.prisma, seed.ts
         src/middleware/auth.ts   authenticate + authorize(role) guards
         src/routes/              auth, tasks, users
         src/validation.ts        Zod schemas
client/  src/pages/               Login, Home, AddTask, Users
         src/components/          Navbar, TaskItem
         src/auth.tsx, api.ts     auth context + fetch wrapper
```

## Deployment (suggested)

- **Database:** Neon or Supabase (PostgreSQL)
- **API (Render / Railway):** root `server`, build `npm install && npm run build`, start `npm run db:push && npm start`, set env vars above. Run `npm run seed` once.
- **Frontend (Vercel / Netlify):** root `client`, build `npm run build`, output `dist`, set `VITE_API_URL=https://<api-host>/api`. SPA rewrites are included (`vercel.json`, `public/_redirects`).
- Set the API's `CLIENT_URL` to the deployed frontend URL.

## Design decisions
- Authorization is enforced on the server; the UI only hides what a role cannot use.
- Admins have read-only access to all tasks; only users create and manage tasks, as the requirements list.
- Accessing someone else's task returns 404 rather than 403 so IDs are not leaked.
- Pagination, filtering and sorting run in the database query, not in the browser.