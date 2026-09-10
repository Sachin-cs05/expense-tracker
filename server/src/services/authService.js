import { ZodError } from "zod";
import { createToken } from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserDocumentById,
  updateUser,
  deleteUserById
} from "../repositories/userRepository.js";
import { seedDefaultCategories } from "./categoryService.js";
import { deleteAllForOwner } from "./cascadeDeleteService.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updatePreferencesSchema,
  updateProfileSchema
} from "../validation.js";

export class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

function buildAuthResponse(user) {
  return {
    token: createToken({
      sub: user.id,
      email: user.email
    }),
    user
  };
}

export async function registerUser(payload) {
  const validated = registerSchema.parse(payload);

  const existingUser = await findUserByEmail(validated.email);

  if (existingUser) {
    throw new AuthError(
      "An account with this email already exists.",
      409
    );
  }

  const user = await createUser({
    name: validated.name,
    email: validated.email,
    passwordHash: hashPassword(validated.password)
  });

  await seedDefaultCategories(user.id);

  return buildAuthResponse(user);
}

export async function loginUser(payload) {
  const validated = loginSchema.parse(payload);

  const userDocument = await findUserByEmail(validated.email);

  if (
    !userDocument ||
    !verifyPassword(validated.password, userDocument.passwordHash)
  ) {
    throw new AuthError("Invalid email or password.", 401);
  }

  return buildAuthResponse(userDocument.toJSON());
}

export async function getAuthenticatedUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthError("User not found.", 401);
  }

  return user;
}

export async function updateUserProfile(userId, payload) {
  const validated = updateProfileSchema.parse(payload);
  const user = await updateUser(userId, validated);
  if (!user) throw new AuthError("User not found.", 404);
  return user;
}

export async function updateUserPreferences(userId, payload) {
  const validated = updatePreferencesSchema.parse(payload);
  const user = await updateUser(userId, validated);
  if (!user) throw new AuthError("User not found.", 404);
  return user;
}

export async function changeUserPassword(userId, payload) {
  const validated = changePasswordSchema.parse(payload);
  const userDocument = await findUserDocumentById(userId);

  if (!userDocument || !verifyPassword(validated.currentPassword, userDocument.passwordHash)) {
    throw new AuthError("Current password is incorrect.", 401);
  }

  userDocument.passwordHash = hashPassword(validated.newPassword);
  await userDocument.save();
  return true;
}

export async function deleteAccount(userId) {
  await deleteAllForOwner(userId);
  await deleteUserById(userId);
  return true;
}

export function handleAuthRouteError(error, response) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Validation failed.",
      issues: error.issues
    });
    return;
  }

  if (error instanceof AuthError) {
    response.status(error.statusCode).json({
      message: error.message
    });
    return;
  }

  response.status(500).json({
    message: error.message || "Authentication failed."
  });
}