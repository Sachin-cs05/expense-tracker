import express from "express";
import { ZodError } from "zod";
import { addSpace, editSpace, getSpaces, removeSpace } from "../services/spaceService.js";

export const spaceRouter = express.Router();

spaceRouter.get("/", async (request, response) => {
  response.json(await getSpaces(request.user.id));
});

spaceRouter.post("/", async (request, response) => {
  try {
    response.status(201).json(await addSpace(request.user.id, request.body));
  } catch (error) {
    handleValidationError(error, response);
  }
});

spaceRouter.put("/:id", async (request, response) => {
  try {
    const updated = await editSpace(request.user.id, request.params.id, request.body);
    if (!updated) {
      response.status(404).json({ message: "Space not found." });
      return;
    }
    response.json(updated);
  } catch (error) {
    handleValidationError(error, response);
  }
});

spaceRouter.delete("/:id", async (request, response) => {
  const removed = await removeSpace(request.user.id, request.params.id);
  if (!removed) {
    response.status(404).json({ message: "Space not found." });
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
