import express from "express";
import { ZodError } from "zod";
import { addCategory, getCategories, removeCategory } from "../services/categoryService.js";

export const categoryRouter = express.Router();

categoryRouter.get("/", async (request, response) => {
  response.json(await getCategories(request.user.id, request.query.type));
});

categoryRouter.post("/", async (request, response) => {
  try {
    response.status(201).json(await addCategory(request.user.id, request.body));
  } catch (error) {
    if (error instanceof ZodError) {
      response.status(400).json({ message: "Validation failed.", issues: error.issues });
      return;
    }
    if (error?.code === 11000) {
      response.status(409).json({ message: "A category with this name already exists." });
      return;
    }
    response.status(500).json({ message: error.message || "Unable to save category." });
  }
});

categoryRouter.delete("/:id", async (request, response) => {
  if (!(await removeCategory(request.user.id, request.params.id))) {
    response.status(404).json({ message: "Category not found." });
    return;
  }
  response.status(204).send();
});
