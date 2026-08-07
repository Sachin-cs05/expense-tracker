# Expense Tracker Application

A full-stack smart expense tracker with MongoDB persistence, personalized spending insights, budgets, savings goals, exports, and JWT authentication.

## Features

- Email/password registration and login secured with JWTs
- Add, edit, delete, search, and filter expenses
- Categories for Food, Travel, Shopping, Bills, and Entertainment
- Dashboard analytics with pie, bar, and line charts
- Smart category suggestions based on expense descriptions (for example, Uber → Travel and Swiggy → Food)
- Smart Search for phrases such as `food last month` and `travel this month`
- Monthly budget setting with threshold and overspending alerts
- Month-end spend forecasting from the current daily spending rate
- Personalized insights for top categories and month-over-month spending changes
- Recurring-payment detection for repeat monthly expenses
- Savings goals with target dates, saved amounts, and progress bars
- CSV and Excel export
- Dark mode toggle
- Modular backend with route, service, and repository layers
- User-scoped expenses, budgets, and savings goals

## Using Smart Features

### Smart category suggestions

When adding an expense, enter a description such as `Uber ride`, `Netflix`, or `electricity bill`. The application suggests a matching category automatically. You can always select a different category manually.

### Smart Search

Use the Smart Search field to quickly apply common filters:

- `food last month` filters Food expenses from the previous month.
- `travel this month` filters Travel expenses from the current month.
- Any other text searches expense descriptions.

Use **Clear Filters** to reset Smart Search and every other filter.

### Forecasts, alerts, and recurring payments

The **Smart Assistant** panel shows the projected total for the current month, alerts when your budget is at risk, and identifies repeat monthly transactions such as rent or subscriptions. These results become more useful as more expenses are recorded.

### Savings goals

Use **Savings Goals** to track a specific target. For example:

- Goal name: `New Laptop`
- Target amount: `60000`
- Already saved: `15000`
- Target date: `2026-12-31`

The app displays `₹15,000 of ₹60,000` and a 25% progress bar.

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

### MongoDB Atlas

If you want to use MongoDB Atlas instead of local MongoDB:

1. Create a free cluster in Atlas.
2. Add a database user with a password.
3. Open Network Access and add your IP address, or temporarily allow `0.0.0.0/0` for testing.
4. Copy the connection string and replace the placeholders:

```bash
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority"
```

5. Add that value to your `.env` file.

If you see `querySrv ENOTFOUND`, the Atlas cluster hostname in `MONGODB_URI` is incorrect or cannot be resolved. Copy the complete connection string again from **Atlas → Database → Connect → Drivers**; do not type the cluster hostname manually.

### Deploying to a hosting platform

This project is easiest to deploy on providers that support Node.js servers, such as Render, Railway, or Fly.io.

For example, on Render:

- Connect your GitHub repository.
- Set the build command to `npm install && npm run build`.
- Set the start command to `npm start`.
- Add environment variables:
  - `MONGODB_URI` with your Atlas URI
  - `JWT_SECRET` with a long secret
  - `JWT_EXPIRES_IN=7d`

Render will provide a port via `PORT`, and the backend already uses `process.env.PORT || 4000`.

If you use Atlas and deployment still fails, confirm:

- the Atlas user exists and has access to the cluster
- the network access IP is allowed
- the URI is correctly pasted into the environment variable
- the database name at the end of the URI matches `expense-tracker`

For most deployments, `mongodb+srv://` is acceptable and should work with Mongoose v8.

For production:

```bash
npm run build
npm start
```

## Notes

- Existing unauthenticated data is not shown once user-scoped auth is enabled.
- New expenses and budgets are stored per authenticated user.
