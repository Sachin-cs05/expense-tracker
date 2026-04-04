import express from "express";
import { ZodError } from "zod";
import { expenseCategories } from "../constants.js";
import { getDailyProgression, getSummary, getMonthlyTrend, getCategoryTotals } from "../services/analyticsService.js";
import { addExpense, editExpense, getExpenses, removeExpense } from "../services/expenseService.js";

export const expenseRouter = express.Router();

expenseRouter.get("/categories", (_request, response) => {
  response.json(expenseCategories);
});

expenseRouter.get("/", async (request, response) => {
  response.json(await getExpenses(request.user.id, request.query));
});

expenseRouter.post("/", async (request, response) => {
  try {
    const createdExpense = await addExpense(request.user.id, request.body);
    response.status(201).json(createdExpense);
  } catch (error) {
    handleValidationError(error, response);
  }
});

expenseRouter.put("/:id", async (request, response) => {
  try {
    const updatedExpense = await editExpense(request.user.id, request.params.id, request.body);

    if (!updatedExpense) {
      response.status(404).json({ message: "Expense not found." });
      return;
    }

    response.json(updatedExpense);
  } catch (error) {
    handleValidationError(error, response);
  }
});

expenseRouter.delete("/:id", async (request, response) => {
  const removed = await removeExpense(request.user.id, request.params.id);

  if (!removed) {
    response.status(404).json({ message: "Expense not found." });
    return;
  }

  response.status(204).send();
});

expenseRouter.get("/analytics/summary", async (request, response) => {
  response.json(await getSummary(request.user.id, request.query));
});

expenseRouter.get("/analytics/category", async (request, response) => {
  response.json(await getCategoryTotals(request.user.id, request.query));
});

expenseRouter.get("/analytics/monthly", async (request, response) => {
  response.json(await getMonthlyTrend(request.user.id));
});

expenseRouter.get("/analytics/daily", async (request, response) => {
  response.json(await getDailyProgression(request.user.id, request.query));
});

function handleValidationError(error, response) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      issues: error.issues
    });
    return;
  }

  response.status(500).json({ message: error.message || "Something went wrong." });
}
