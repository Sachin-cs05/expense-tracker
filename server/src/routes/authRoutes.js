import express from "express";
import { getAuthenticatedUser, handleAuthRouteError, loginUser, registerUser } from "../services/authService.js";
import { verifyToken } from "../utils/jwt.js";

export const authRouter = express.Router();

authRouter.post("/register", async (request, response) => {
  try {
    response.status(201).json(await registerUser(request.body));
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});

authRouter.post("/login", async (request, response) => {
  try {
    response.json(await loginUser(request.body));
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});

authRouter.get("/me", async (request, response) => {
  try {
    const authorization = request.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      response.status(401).json({ message: "Authentication required." });
      return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = verifyToken(token);

    response.json({ user: await getAuthenticatedUser(payload.sub) });
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});
