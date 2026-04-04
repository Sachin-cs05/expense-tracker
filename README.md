# Expense Tracker Application

A full-stack expense tracker with responsive UI, MongoDB persistence, analytics dashboard, budget alerts, CSV and Excel export, and JWT authentication.

## Features

- Email/password registration and login secured with JWTs
- Add, edit, delete, search, and filter expenses
- Categories for Food, Travel, Shopping, Bills, and Entertainment
- Dashboard analytics with pie, bar, and line charts
- Monthly budget setting with overspending alerts
- CSV and Excel export
- Dark mode toggle
- Modular backend with route, service, and repository layers
- User-scoped expense and budget data

## Tech Stack

- Frontend: React + Vite + Recharts
- Backend: Express
- Database: MongoDB with Mongoose
- Authentication: Custom JWT + password hashing with Node crypto
- Export: `xlsx`

## Setup

Create a `.env` file from `.env.example`, then run:

```bash
npm install
npm run dev
```

Required environment variables:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=replace-this-with-a-long-random-secret
JWT_EXPIRES_IN=7d
```

If `MONGODB_URI` is not set, the local MongoDB URI above is used.

For production:

```bash
npm run build
npm start
```

## Notes

- Existing unauthenticated data is not shown once user-scoped auth is enabled.
- New expenses and budgets are stored per authenticated user.
