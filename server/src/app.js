import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { requireAuth } from "./middleware/authMiddleware.js";
import { authRouter } from "./routes/authRoutes.js";
import { expenseRouter } from "./routes/expenseRoutes.js";
import { budgetRouter } from "./routes/budgetRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../dist/client");
const clientIndexPath = path.join(clientDistPath, "index.html");

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api", requireAuth);
  app.use("/api/expenses", expenseRouter);
  app.use("/api/budgets", budgetRouter);
  app.use("/api/reports", reportRouter);

  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(clientDistPath));
    app.get("/*splat", (_request, response) => {
      response.sendFile(clientIndexPath);
    });
  } else {
    app.get("/", (_request, response) => {
      response
        .status(200)
        .send("Expense Tracker API is running. Start Vite with `npm run dev` or build the app with `npm run build`.");
    });
  }

  return app;
}
