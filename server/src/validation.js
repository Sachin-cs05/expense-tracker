import { z } from "zod";
import { expenseCategories } from "./constants.js";

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  category: z.enum(expenseCategories),
  date: z.string().min(1, "Date is required."),
  description: z.string().trim().min(2, "Description is required.").max(120, "Description is too long.")
});

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format."),
  amount: z.coerce.number().positive("Budget must be greater than zero.")
});

export const savingsGoalSchema = z.object({
  name: z.string().trim().min(2, "Goal name is required.").max(80, "Goal name is too long."),
  targetAmount: z.coerce.number().positive("Target amount must be greater than zero."),
  savedAmount: z.coerce.number().min(0, "Saved amount cannot be negative.").default(0),
  targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Target date must be in YYYY-MM-DD format.")
});

export const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters long.").max(72, "Password is too long.")
});

export const loginSchema = registerSchema;
