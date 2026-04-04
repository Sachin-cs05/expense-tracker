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

export const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters long.").max(72, "Password is too long.")
});

export const loginSchema = registerSchema;
