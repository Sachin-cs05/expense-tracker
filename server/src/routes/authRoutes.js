import express from "express";
import {
  changeUserPassword,
  deleteAccount,
  getAuthenticatedUser,
  handleAuthRouteError,
  loginUser,
  registerUser,
  updateUserPreferences,
  updateUserProfile
} from "../services/authService.js";
import {
  getGoogleAuthUrl,
  handleGoogleCallback,
  getGithubAuthUrl,
  handleGithubCallback,
  buildFrontendRedirect,
  buildFrontendErrorRedirect
} from "../services/oauthService.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { verifyToken } from "../utils/jwt.js";

export const authRouter = express.Router();

// ---- OAuth Endpoints ----
authRouter.get("/google", (request, response) => {
  try {
    const authUrl = getGoogleAuthUrl();
    response.redirect(authUrl);
  } catch (error) {
    response.redirect(buildFrontendErrorRedirect(error.message));
  }
});

authRouter.get("/google/callback", async (request, response) => {
  try {
    const { token } = await handleGoogleCallback(request.query);
    response.redirect(buildFrontendRedirect(token));
  } catch (error) {
    response.redirect(buildFrontendErrorRedirect(error.message));
  }
});

authRouter.get("/github", (request, response) => {
  try {
    const authUrl = getGithubAuthUrl();
    response.redirect(authUrl);
  } catch (error) {
    response.redirect(buildFrontendErrorRedirect(error.message));
  }
});

authRouter.get("/github/callback", async (request, response) => {
  try {
    const { token } = await handleGithubCallback(request.query);
    response.redirect(buildFrontendRedirect(token));
  } catch (error) {
    response.redirect(buildFrontendErrorRedirect(error.message));
  }
});

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

authRouter.put("/profile", requireAuth, async (request, response) => {
  try {
    response.json({ user: await updateUserProfile(request.user.id, request.body) });
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});

authRouter.put("/preferences", requireAuth, async (request, response) => {
  try {
    response.json({ user: await updateUserPreferences(request.user.id, request.body) });
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});

authRouter.post("/change-password", requireAuth, async (request, response) => {
  try {
    await changeUserPassword(request.user.id, request.body);
    response.json({ message: "Password updated successfully." });
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});

authRouter.delete("/account", requireAuth, async (request, response) => {
  try {
    await deleteAccount(request.user.id);
    response.status(204).send();
  } catch (error) {
    handleAuthRouteError(error, response);
  }
});
