# Expense Tracker Application - Complete Documentation

## Project Overview

**Project Name:** Expense Tracker Analytics  
**Version:** 1.0.0  
**Type:** Full-Stack Web Application  
**Status:** Active Development

The Expense Tracker is a comprehensive full-stack web application designed to help users manage their expenses efficiently. It provides real-time analytics, budget management, expense categorization, and data export capabilities with a responsive user interface.

---

## Key Features

### 1. Authentication & Security
- Email/password-based registration and login
- JWT (JSON Web Token) authentication
- Secure password hashing using Node.js crypto
- User-scoped data isolation
- Token expiration: 7 days

### 2. Expense Management
- Add, edit, delete, search, and filter expenses
- Five expense categories:
  - Food
  - Travel
  - Shopping
  - Bills
  - Entertainment
- Real-time expense filtering and search
- Timestamp tracking (created/updated)
- User-scoped expense data

### 3. Budget Management
- Set monthly budgets
- Overspending alerts and notifications
- Budget tracking per month
- Budget edit and update capabilities

### 4. Analytics & Dashboard
- **Pie Charts:** Category-wise expense distribution
- **Bar Charts:** Monthly comparison
- **Line Charts:** Daily progression tracking
- **Summary Cards:** Total expenses, monthly trends, category insights
- Daily expense progression visualization
- Monthly trend analysis

### 5. Data Export
- CSV export functionality
- Excel (XLSX) export functionality
- Export filtered or full expense data

### 6. User Interface
- Responsive design (Mobile, Tablet, Desktop)
- Dark mode toggle
- Intuitive dashboard layout
- Real-time data updates
- Modern UI components

---

## Technology Stack

### Frontend
- **Framework:** React 19.1.0
- **Build Tool:** Vite 6.2.0
- **Charting Library:** Recharts 2.15.2
- **Styling:** CSS3
- **HTTP Client:** Fetch API with custom wrapper

### Backend
- **Runtime:** Node.js (with ES Modules)
- **Server Framework:** Express 5.1.0
- **Database:** MongoDB with Mongoose 8.13.2
- **Validation:** Zod 3.24.2
- **CORS:** cors 2.8.5

### Development Tools
- **Vite React Plugin:** @vitejs/plugin-react 4.4.1
- **Concurrency Manager:** concurrently 9.1.2
- **File Watcher:** nodemon 3.1.14

### Production-Ready Libraries
- **Date Manipulation:** date-fns 4.1.0
- **Excel Export:** xlsx 0.18.5

---

## Project Structure

```
expense-tracker/
│
├── Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   ├── styles.css              # Global styles
│   │   │
│   │   ├── components/
│   │   │   ├── App.jsx             # Main application wrapper
│   │   │   ├── AuthPanel.jsx       # Authentication UI
│   │   │   ├── BudgetPanel.jsx     # Budget management
│   │   │   ├── ChartsPanel.jsx     # Analytics visualizations
│   │   │   ├── ExpenseForm.jsx     # Expense input form
│   │   │   ├── ExpenseTable.jsx    # Expense list view
│   │   │   ├── FilterBar.jsx       # Search & filter controls
│   │   │   ├── Header.jsx          # App header/navigation
│   │   │   └── SummaryCards.jsx    # Summary statistics
│   │   │
│   │   └── lib/
│   │       └── api.js              # API client
│   │
│   ├── index.html
│   └── package.json
│
├── Backend (Express + MongoDB)
│   ├── server/
│   │   ├── index.js                # Server entry point
│   │   │
│   │   └── src/
│   │       ├── app.js              # Express app configuration
│   │       ├── constants.js        # Shared constants
│   │       ├── validation.js       # Input validation schemas
│   │       │
│   │       ├── db/
│   │       │   └── database.js     # MongoDB connection
│   │       │
│   │       ├── middleware/
│   │       │   └── authMiddleware.js    # JWT verification
│   │       │
│   │       ├── models/
│   │       │   ├── Budget.js       # Budget schema
│   │       │   ├── Expense.js      # Expense schema
│   │       │   └── User.js         # User schema
│   │       │
│   │       ├── repositories/
│   │       │   ├── budgetRepository.js      # Budget DB operations
│   │       │   ├── expenseRepository.js     # Expense DB operations
│   │       │   └── userRepository.js       # User DB operations
│   │       │
│   │       ├── routes/
│   │       │   ├── authRoutes.js        # Auth endpoints (/api/auth)
│   │       │   ├── budgetRoutes.js      # Budget endpoints (/api/budgets)
│   │       │   ├── expenseRoutes.js     # Expense endpoints (/api/expenses)
│   │       │   └── reportRoutes.js      # Reports endpoints (/api/reports)
│   │       │
│   │       ├── services/
│   │       │   ├── analyticsService.js  # Analytics calculations
│   │       │   ├── authService.js       # Auth logic
│   │       │   ├── expenseService.js    # Expense business logic
│   │       │   └── exportService.js     # Export functionality
│   │       │
│   │       └── utils/
│   │           ├── env.js          # Environment variables
│   │           ├── jwt.js          # JWT utilities
│   │           └── password.js     # Password hashing
│   │
│   └── package.json
│
├── Deployment
│   ├── api/                        # Vercel serverless functions
│   │   ├── [...path].js           # API route handler
│   │   ├── _handler.js            # Handler wrapper
│   │   └── index.js               # Health check
│   │
│   ├── dist/                       # Build output
│   │   └── client/               # Frontend build
│   │
│   ├── scripts/
│   │   ├── dev.js                 # Development script
│   │   └── copy-server-assets.js  # Asset copying
│   │
│   ├── vercel.json                # Vercel configuration
│   └── vite.config.js             # Vite configuration
│
├── Configuration Files
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Project dependencies
│   ├── README.md                  # Setup instructions
│   ├── deployment-guide.md        # Deployment steps
│   └── vite.config.js             # Build configuration
```

---

## API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register User
- **Method:** POST
- **Endpoint:** `/api/auth/register`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response (201):**
  ```json
  {
    "user": { "id": "...", "email": "..." },
    "token": "jwt_token_here"
  }
  ```

#### 2. Login User
- **Method:** POST
- **Endpoint:** `/api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response (200):**
  ```json
  {
    "user": { "id": "...", "email": "..." },
    "token": "jwt_token_here"
  }
  ```

#### 3. Get Current User
- **Method:** GET
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):**
  ```json
  {
    "user": { "id": "...", "email": "..." }
  }
  ```

### Expense Routes (`/api/expenses`) - Requires Authentication

#### 1. Get All Expense Categories
- **Method:** GET
- **Endpoint:** `/api/expenses/categories`
- **Response:**
  ```json
  ["Food", "Travel", "Shopping", "Bills", "Entertainment"]
  ```

#### 2. Get All Expenses
- **Method:** GET
- **Endpoint:** `/api/expenses`
- **Query Parameters:**
  - `category` - Filter by category
  - `startDate` - Filter from date (YYYY-MM-DD)
  - `endDate` - Filter to date (YYYY-MM-DD)
  - `search` - Search in description
- **Response:**
  ```json
  [
    {
      "id": "...",
      "amount": 50.00,
      "category": "Food",
      "date": "2025-01-15",
      "description": "Lunch",
      "ownerId": "...",
      "createdAt": "2025-01-15T12:00:00Z",
      "updatedAt": "2025-01-15T12:00:00Z"
    }
  ]
  ```

#### 3. Add New Expense
- **Method:** POST
- **Endpoint:** `/api/expenses`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "amount": 50.00,
    "category": "Food",
    "date": "2025-01-15",
    "description": "Lunch at restaurant"
  }
  ```
- **Response (201):** Expense object

#### 4. Update Expense
- **Method:** PUT
- **Endpoint:** `/api/expenses/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Same as add expense
- **Response (200):** Updated expense object

#### 5. Delete Expense
- **Method:** DELETE
- **Endpoint:** `/api/expenses/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** 204 No Content

### Budget Routes (`/api/budgets`) - Requires Authentication

#### 1. Get Monthly Budget
- **Method:** GET
- **Endpoint:** `/api/budgets/:month` (format: YYYY-MM)
- **Response:**
  ```json
  {
    "id": "...",
    "month": "2025-01",
    "amount": 5000,
    "ownerId": "...",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
  ```

#### 2. Set/Update Monthly Budget
- **Method:** POST
- **Endpoint:** `/api/budgets`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "month": "2025-01",
    "amount": 5000
  }
  ```
- **Response (201/200):** Budget object

### Reports/Analytics Routes (`/api/reports`) - Requires Authentication

#### 1. Get Summary
- **Method:** GET
- **Endpoint:** `/api/reports/summary`
- **Response:**
  ```json
  {
    "totalExpenses": 1500.50,
    "expenseCount": 15,
    "currentMonth": "2025-01",
    "monthlyTotal": 450.25
  }
  ```

#### 2. Get Category Totals
- **Method:** GET
- **Endpoint:** `/api/reports/category-totals`
- **Response:**
  ```json
  [
    { "category": "Food", "total": 500 },
    { "category": "Travel", "total": 300 },
    ...
  ]
  ```

#### 3. Get Monthly Trend
- **Method:** GET
- **Endpoint:** `/api/reports/monthly-trend`
- **Response:**
  ```json
  [
    { "month": "2024-11", "total": 1000 },
    { "month": "2024-12", "total": 1500 },
    { "month": "2025-01", "total": 1200 }
  ]
  ```

#### 4. Get Daily Progression
- **Method:** GET
- **Endpoint:** `/api/reports/daily-progression`
- **Response:**
  ```json
  [
    { "date": "2025-01-01", "cumulative": 50 },
    { "date": "2025-01-02", "cumulative": 120 },
    ...
  ]
  ```

---

## Database Schema

### User Model
```
{
  _id: ObjectId (auto-generated)
  email: String (unique, required)
  passwordHash: String (required)
  createdAt: DateTime (auto-generated)
  updatedAt: DateTime (auto-generated)
}
```

### Expense Model
```
{
  _id: ObjectId (auto-generated)
  ownerId: ObjectId (ref: User, indexed, required)
  amount: Number (required)
  category: String (required)
  date: String (YYYY-MM-DD format, required)
  description: String (required)
  createdAt: DateTime (auto-generated)
  updatedAt: DateTime (auto-generated)
}
```

### Budget Model
```
{
  _id: ObjectId (auto-generated)
  ownerId: ObjectId (ref: User, indexed, required)
  month: String (YYYY-MM format, required)
  amount: Number (required)
  createdAt: DateTime (auto-generated)
  updatedAt: DateTime (auto-generated)
  
  Index: unique combination of (ownerId, month)
}
```

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/expense-tracker

# JWT Configuration
JWT_SECRET=replace-this-with-a-long-random-secret-string-of-at-least-32-characters
JWT_EXPIRES_IN=7d

# Server Configuration (optional)
PORT=4000
NODE_ENV=development
```

### MongoDB Connection Strings

**Local MongoDB:**
```
mongodb://127.0.0.1:27017/expense-tracker
```

**MongoDB Atlas (Cloud):**
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-tracker?retryWrites=true&w=majority
```

### Database Name
Always use `expense-tracker` as the database name for consistency.

---

## Development Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally OR MongoDB Atlas account
- npm or yarn package manager

### Installation Steps

1. **Clone/Setup Project**
   ```bash
   cd "d:\Sachin Drive\Projects\Expense Tracker"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   This runs both frontend (Vite on port 5173) and backend (Express on port 4000) concurrently.

### Available NPM Scripts

```json
{
  "dev": "node scripts/dev.js",           // Run dev server (frontend + backend)
  "dev:server": "node --watch server/index.js",  // Backend only with auto-reload
  "dev:client": "vite",                   // Frontend only (Vite)
  "build": "vite build && node scripts/copy-server-assets.js",  // Production build
  "start": "node server/index.js"         // Start production server
}
```

### Development Workflow

1. **Open Terminals:**
   - Terminal 1: `npm run dev:server` (Backend with auto-reload)
   - Terminal 2: `npm run dev:client` (Frontend development server)

2. **API Proxy:**
   - Frontend dev server proxies `/api` requests to `http://localhost:4000`
   - Configured in `vite.config.js`

3. **Auto-Reload:**
   - Backend: Changes trigger automatic restart (nodemon)
   - Frontend: Hot module replacement (HMR) enabled

---

## Production Build

### Building for Production

```bash
npm run build
```

This command:
1. Builds frontend with Vite to `dist/client`
2. Runs asset copy script for backend
3. Optimizes and chunks code (Recharts → charts.js, vendors → vendor.js)

### Starting Production Server

```bash
npm start
```

Server will:
- Start on port specified by `PORT` env var or default to 4000
- Serve frontend static files from `dist/client`
- Provide API endpoints from Express backend
- Enable SPA routing (fallback to index.html)

---

## Deployment

### Vercel Deployment

**Prerequisites:**
- GitHub repository connected to Vercel
- MongoDB Atlas account with cluster
- Vercel project created

**Configuration:**

1. **Build Command:**
   ```
   npm install && npm run build
   ```

2. **Start Command:**
   ```
   npm start
   ```

3. **Environment Variables:**
   - `MONGODB_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Long random secret for JWT signing
   - `JWT_EXPIRES_IN` - Token expiration (default: 7d)

**MongoDB Atlas Setup:**
- Create free cluster
- Add database user with password
- Add IP whitelist (use 0.0.0.0/0 for Vercel)
- Get connection string with `mongodb+srv://` protocol

**Important Notes:**
- Ensure database name in URI is `expense-tracker`
- Mongoose v8 supports `mongodb+srv://` protocol
- Token automatically uses `process.env.PORT` if provided

### Other Hosting Platforms

Recommended platforms that support Node.js:
- **Render.com**
- **Railway.app**
- **Fly.io**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**
- **DigitalOcean App Platform**

---

## Key Dependencies & Their Roles

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.1.0 | Web server framework |
| mongoose | 8.13.2 | MongoDB object modeling |
| cors | 2.8.5 | Cross-origin resource sharing |
| react | 19.1.0 | Frontend UI library |
| vite | 6.2.0 | Frontend build tool |
| recharts | 2.15.2 | Data visualization charts |
| xlsx | 0.18.5 | Excel export functionality |
| zod | 3.24.2 | TypeScript schema validation |
| date-fns | 4.1.0 | Date manipulation utility |

---

## Security Features

1. **JWT Authentication**
   - Token-based stateless authentication
   - 7-day expiration by default
   - Bearer token in Authorization header

2. **Password Security**
   - Hashed using Node.js crypto module
   - Never stored in plain text
   - Validated on every login

3. **Data Isolation**
   - All data scoped to authenticated user ID
   - Database queries filter by `ownerId`
   - Prevents unauthorized access to other users' data

4. **CORS Protection**
   - Properly configured CORS headers
   - Prevents unauthorized cross-origin requests

5. **Input Validation**
   - Zod schema validation on all inputs
   - Type checking for all API requests
   - Error messages for invalid data

---

## Performance Optimizations

1. **Code Splitting (Frontend)**
   - Recharts library → `charts.js`
   - Node modules → `vendor.js`
   - Main app code → separate chunk

2. **Database Indexing**
   - `ownerId` indexed on Expense and Budget collections
   - Unique composite index on Budget (ownerId + month)
   - Faster queries for filtered data

3. **Caching**
   - Browser caching for static assets
   - Vite's optimized production build

4. **CORS Enabled**
   - Allows browser caching
   - Reduces request overhead

---

## Features by User Role

### Unauthenticated Users
- View home page/landing
- Register new account
- Login

### Authenticated Users
- View personal dashboard
- Add/edit/delete expenses
- Filter and search expenses
- Set monthly budgets
- View analytics and charts
- Export data (CSV/Excel)
- Toggle dark mode
- View personal profile

---

## Troubleshooting

### Common Issues

1. **MongoDB Connection Fails**
   - Verify MongoDB running locally: `mongod`
   - Check connection string in `.env`
   - Ensure database name is `expense-tracker`

2. **Port Already in Use**
   - Backend: Change `PORT` in `.env`
   - Frontend: Vite will find next available port

3. **Authentication Issues**
   - Clear browser localStorage (tokens stored there)
   - Ensure JWT_SECRET matches between instances
   - Check token expiration

4. **API Proxy Not Working**
   - Restart Vite dev server
   - Check backend is running on port 4000
   - Verify proxy config in `vite.config.js`

5. **Build Fails**
   - Clear `node_modules` and reinstall: `npm ci`
   - Check Node.js version compatibility
   - Ensure all env variables are set

---

## Future Enhancement Ideas

1. Recurring expense automation
2. Multiple account/shared expenses
3. Receipt image upload
4. Mobile app (React Native)
5. Advanced filtering and reporting
6. Budget categories breakdown
7. Expense predictions
8. Bill reminders
9. Multi-currency support
10. Data import functionality

---

## License & Credits

**Project Type:** Full-Stack Web Application  
**Created:** 2025  
**Version:** 1.0.0

---

## Contact & Support

For issues, feature requests, or questions about this project, please refer to the deployment guide and README.md for additional information.

