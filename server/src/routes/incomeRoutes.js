import express from "express";
import { ZodError } from "zod";
import {
  addIncome,
  editIncome,
  getIncomeSummary,
  getIncomes,
  removeIncome
} from "../services/incomeService.js";

export const incomeRouter = express.Router();

incomeRouter.get("/", async (request, response) => {
  response.json(await getIncomes(request.user.id, request.query));
});

incomeRouter.get("/summary", async (request, response) => {
  response.json(await getIncomeSummary(request.user.id, request.query));
});

incomeRouter.post("/", async (request, response) => {
  try {
    response.status(201).json(await addIncome(request.user.id, request.body));
  } catch (error) {
    handleValidationError(error, response);
  }
});

incomeRouter.put("/:id", async (request, response) => {
  try {
    const updated = await editIncome(request.user.id, request.params.id, request.body);
    if (!updated) {
      response.status(404).json({ message: "Income not found." });
      return;
    }
    response.json(updated);
  } catch (error) {
    handleValidationError(error, response);
  }
});

incomeRouter.delete("/:id", async (request, response) => {
  const removed = await removeIncome(request.user.id, request.params.id);
  if (!removed) {
    response.status(404).json({ message: "Income not found." });
    return;
  }
  response.status(204).send();
});

function handleValidationError(error, response) {
  if (error instanceof ZodError) {
    response.status(400).json({ message: "Validation failed.", issues: error.issues });
    return;
  }
  response.status(500).json({ message: error.message || "Something went wrong." });
}
