# FinTrack — Redesign Notes

This is your Expense Tracker, rebuilt into a multi-page "FinTrack" personal finance app,
per the Phase 1 audit. All original functionality is preserved; nothing was deleted.

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in a MongoDB connection string and a JWT secret.
   ```
   cp .env.example .env
   ```
3. Make sure MongoDB is running (local install, or a free Atlas cluster — either works,
   just paste the connection string into `MONGODB_URI`).
4. `npm run dev` — this starts the Express API and the Vite dev server together
   (proxying `/api` to the backend). Open the URL Vite prints (usually `http://localhost:5173`).
5. Register a new account from the login screen — this seeds your default categories.

For a production build: `npm run build` then `npm start`.

## What changed since the audit

**Backend (additive, nothing removed):**
- New models/routes: `Income`, `Category` (replaces the old hardcoded 5-category enum —
  categories are now per-user and creatable), `RecurringPayment`, `Space`
- `Expense` gained optional `paymentMethod`, `notes`, `spaceId` fields (existing expenses
  are unaffected — these default sensibly)
- `User` gained `currency` / `dateFormat` preferences
- New endpoints for profile update, preference update, change password, delete account,
  and CSV/Excel import
- All original endpoints (auth, expenses, budgets, savings goals, CSV/Excel export,
  analytics/insights/forecast) are untouched and still work exactly as before

**Frontend (rebuilt as a real app, not a single page):**
- Proper client-side routing (`react-router-dom`, which was installed but never used
  before) with a fixed sidebar + top header shell
- Pages: Overview, Expenses, Income, Analytics, Budgets, Savings Goals, Recurring,
  Categories, Spaces, Import/Export, Settings
- Light / Dark / System theme
- Quick Add menu, modals for every create/edit action, toasts, empty states, skeleton
  loaders, confirmation dialogs before deletes
- Mobile: collapsible sidebar drawer + bottom navigation, responsive tables

## Known scope trade-offs (so nothing here is a surprise)

- **Budgets are still one total per month** (that's the real backend model — there's no
  per-category budget limit stored anywhere). The Budgets page shows your overall budget
  progress plus an honest category-by-category *spending breakdown* underneath it, rather
  than inventing fake per-category budget limits that don't actually exist in the database.
- **Spaces** can hold Expenses and Income (one space per transaction, optional). Deleting
  a Space unassigns its transactions rather than deleting them.
- The recurring-payment *detection* insight on Overview/Analytics (from the original app)
  is separate from the new managed **Recurring Payments** page — the former is a read-only
  pattern-match over your existing expenses; the latter is where you explicitly add/edit/
  pause subscriptions.
- Verification performed in this environment: full backend route/service/model wiring
  test, `node --check` on every backend file, and a complete `npm run build` (Vite +
  server asset copy) with zero errors. I was not able to run a live MongoDB instance or a
  browser here, so please do a quick click-through after `npm run dev` — if anything's off,
  it should be a small, easy fix rather than a structural one.
