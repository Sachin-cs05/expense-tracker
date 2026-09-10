import express from "express";
import { ZodError } from "zod";
import {
  addRecurringPayment,
  editRecurringPayment,
  getRecurringPayments,
  removeRecurringPayment,
  toggleRecurringPayment
} from "../services/recurringService.js";

export const recurringRouter = express.Router();

recurringRouter.get("/", async (request, response) => {
  response.json(await getRecurringPayments(request.user.id));
});

recurringRouter.post("/", async (request, response) => {
  try {
    response.status(201).json(await addRecurringPayment(request.user.id, request.body));
  } catch (error) {
    handleValidationError(error, response);
  }
});

recurringRouter.put("/:id", async (request, response) => {
  try {
    const updated = await editRecurringPayment(request.user.id, request.params.id, request.body);
    if (!updated) {
      response.status(404).json({ message: "Recurring payment not found." });
      return;
    }
    response.json(updated);
  } catch (error) {
    handleValidationError(error, response);
  }
});

recurringRouter.patch("/:id/toggle", async (request, response) => {
  const updated = await toggleRecurringPayment(request.user.id, request.params.id);
  if (!updated) {
    response.status(404).json({ message: "Recurring payment not found." });
    return;
  }
  response.json(updated);
});

recurringRouter.delete("/:id", async (request, response) => {
  const removed = await removeRecurringPayment(request.user.id, request.params.id);
  if (!removed) {
    response.status(404).json({ message: "Recurring payment not found." });
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
