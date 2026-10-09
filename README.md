# DoIt Today — To-Do List 

DoIt Today is a full-stack task management application built as part of a Full Stack Developer assessment. It allows users to create, update, delete, and organize tasks while providing role-based access control for administrators and regular users.

## Live Demo

- **Live Application:** https://doit-today.vercel.app/
- **Backend API:** https://to-do-api-capq.onrender.com
- **GitHub Repository:** https://github.com/sameertahasiladr/To-Do-List

## Demo Login Credentials

Use these accounts to test the application.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `Admin@123` |
| User | `user@gmail.com` | `User@123` |



## Features

### Task Management
- Create tasks with a name, status, priority, and optional due date.
- Edit and delete existing tasks.
- Mark tasks as complete or incomplete.
- Search tasks by name.
- Filter tasks by status and priority.
- Sort tasks and navigate through paginated results.
- View task statistics and completion progress.
- Preserve search and filter settings in the URL.

### User Management & Role-Based Access Control

**Admin**
- View all registered users.
- Create new user accounts.
- Edit user information.
- Delete user accounts.
- Assign and change user roles.
- View tasks belonging to all users.
- Cannot create, edit, or delete tasks through the task-management functionality.

**User**
- View their own tasks.
- Create new tasks.
- Edit and delete their own tasks.
- Mark their tasks as complete or incomplete.

### Authentication and Security
- JWT-based authentication.
- Password hashing with bcrypt.
- Protected API routes.
- Role-based authorization on the backend.
- Validation of incoming requests.
- Restrictions to prevent users from managing other users' tasks.

### User Interface
- Responsive design for desktop and mobile devices.
- Custom CSS styling.
- Form validation and error messages.
- Loading indicators and toast notifications.
- Confirmation dialogs for important actions.
- Keyboard focus indicators and reduced-motion support.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- React Router
- CSS

**Backend**
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JSON Web Tokens (JWT)
- bcryptjs

## Project Structure

```text
To-Do-List/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.ts
│   │   ├── auth.tsx
│   │   └── types.ts
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── package.json
│   └── .env.example
│
├── README.md
└── AI_PROMPTS.md
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL database

### 1. Clone the Repository

```bash
git clone https://github.com/sameertahasiladr/To-Do-List.git
cd To-Do-List
```

### 2. Set Up the Backend

Navigate to the server directory and install the dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory using `.env.example` as a reference.

Configure the following variables:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_long_random_secret"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

Generate Prisma Client, prepare the database, and seed the sample accounts:

```bash
npx prisma generate
npm run db:push
npm run seed
npm run dev
```

The backend runs at `http://localhost:4000` by default.

### 3. Set Up the Frontend

Open a new terminal from the project root:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## Demo Login Credentials

Use these accounts to test the Local application.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@gmail.com` | `Admin@123` |
| Demo User | `user@gmail.com` | `User@123` |

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `DATABASE_URL` | `server/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `server/.env` | Secret used to sign JWTs |
| `CLIENT_URL` | `server/.env` | Frontend origin allowed by CORS |
| `PORT` | `server/.env` | Backend server port |
| `VITE_API_URL` | `client/.env` | Backend API base URL, including `/api` |



## API Overview

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Authenticated |
| GET | `/api/tasks` | Authenticated |
| GET | `/api/tasks/stats` | Authenticated |
| POST | `/api/tasks` | Regular user |
| PATCH | `/api/tasks/:id` | Task owner |
| DELETE | `/api/tasks/:id` | Task owner |
| GET | `/api/users` | Admin |
| POST | `/api/users` | Admin |
| PATCH | `/api/users/:id` | Admin |
| DELETE | `/api/users/:id` | Admin |

## Deployment

The application is deployed using:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** PostgreSQL

The frontend communicates with the backend through `VITE_API_URL`. The backend uses `CLIENT_URL` to configure permitted cross-origin requests.





