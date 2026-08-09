import express from "express";
import { ZodError } from "zod";
import { addSavingsGoal, editSavingsGoal, getSavingsGoals, removeSavingsGoal } from "../services/savingsGoalService.js";

export const savingsGoalRouter = express.Router();

savingsGoalRouter.get("/", async (request, response) => {
  response.json(await getSavingsGoals(request.user.id));
});

savingsGoalRouter.post("/", async (request, response) => {
  try {
    response.status(201).json(await addSavingsGoal(request.user.id, request.body));
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ message: "Validation failed.", issues: error.issues });
      return;
    }
    response.status(500).json({ message: error.message || "Unable to save savings goal." });
  }
});

savingsGoalRouter.put("/:id", async (request, response) => {
  try {
    const goal = await editSavingsGoal(request.user.id, request.params.id, request.body);
    if (!goal) return response.status(404).json({ message: "Savings goal not found." });
    return response.json(goal);
  } catch (error) {
    if (error instanceof ZodError) return response.status(400).json({ message: "Validation failed.", issues: error.issues });
    return response.status(500).json({ message: error.message || "Unable to update savings goal." });
  }
});

savingsGoalRouter.delete("/:id", async (request, response) => {
  if (!(await removeSavingsGoal(request.user.id, request.params.id))) {
    response.status(404).json({ message: "Savings goal not found." });
    return;
  }
  response.status(204).send();
});
