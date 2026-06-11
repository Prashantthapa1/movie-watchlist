# Movies Watchlist

A full-stack movies watchlist app with a React/Vite frontend and an Express/TypeScript backend. Users can browse movies, search/filter them, manage favorites, track watched movies, and authenticate with email verification.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, TypeScript
- Database: MySQL
- Auth: JWT, bcrypt
- File uploads: Multer
- Email: Nodemailer

## Project Structure

```text
moviesWatchlist/
├── backend/          # Express API and MySQL data layer
├── frontend/         # React/Vite client app
├── MyMovies/         # Additional project files/assets
├── vselfCheck/       # Practice/self-check files
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js
- npm
- MySQL

## Setup

Install dependencies for both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=movies_watchlist

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/health`

## Available Scripts

Backend:

```bash
npm run dev      # Start backend with nodemon and ts-node
npm run build    # Compile TypeScript to dist/
npm start        # Run compiled backend from dist/server.js
npm run clean    # Remove dist/
```

Frontend:

```bash
npm run dev      # Start Vite dev server
npm run build    # Build production frontend
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## API Areas

The backend mounts all API routes under `/api`:

- `/api/auth` - registration, login, logout, token refresh, email verification
- `/api/user` - user-related operations
- `/api/movies` - movie listing, search, create, update, delete, poster upload
- `/api/favorites` - add, list, and remove favorite movies
- `/api/watched` - add, list, and remove watched movies

## Notes

- `.env` files are ignored by Git. Keep real secrets local.
- Uploaded files and generated build output are ignored by Git.
- Make sure MySQL is running and the configured database exists before starting the backend.
