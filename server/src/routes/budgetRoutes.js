import express from "express";
import { ZodError } from "zod";
import { fetchBudget, getSummary, saveBudget } from "../services/analyticsService.js";

export const budgetRouter = express.Router();

budgetRouter.get("/", async (request, response) => {
  const month = request.query.month;

  if (!month) {
    response.status(400).json({ message: "Month is required." });
    return;
  }

  response.json({
    budget: await fetchBudget(request.user.id, month),
    status: (await getSummary(request.user.id, { month })).budgetStatus
  });
});

budgetRouter.post("/", async (request, response) => {
  try {
    const budget = await saveBudget(request.user.id, request.body);
    response.status(201).json(budget);
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({
        message: "Validation failed.",
        issues: error.issues
      });
      return;
    }

    response.status(500).json({ message: error.message || "Something went wrong." });
  }
});
