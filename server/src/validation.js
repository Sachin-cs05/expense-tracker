import { z } from "zod";
import { recurringFrequencies, currencies } from "./constants.js";

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  category: z.string().trim().min(1, "Category is required.").max(40, "Category name is too long."),
  date: z.string().min(1, "Date is required."),
  description: z
    .string()
    .trim()
    .min(2, "Description is required.")
    .max(120, "Description is too long."),
  paymentMethod: z.string().trim().max(40).optional().default("Other"),
  notes: z.string().trim().max(300).optional().default(""),
  spaceId: z.string().trim().nullable().optional()
});

export const incomeSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  source: z
    .string()
    .trim()
    .min(2, "Source is required.")
    .max(120, "Source is too long."),
  category: z.string().trim().min(1, "Category is required.").max(40),
  paymentMethod: z.string().trim().max(40).optional().default("Bank Transfer"),
  date: z.string().min(1, "Date is required."),
  notes: z.string().trim().max(300).optional().default(""),
  spaceId: z.string().trim().nullable().optional()
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(40, "Category name is too long."),
  icon: z.string().trim().max(8).optional().default("🏷️"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #4F46E5.")
    .optional()
    .default("#4F46E5"),
  type: z.enum(["expense", "income"]).optional().default("expense")
});

export const recurringPaymentSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name is too long."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  category: z.string().trim().min(1, "Category is required.").max(40),
  frequency: z.enum(recurringFrequencies).optional().default("monthly"),
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Next payment date must be in YYYY-MM-DD format."),
  active: z.coerce.boolean().optional().default(true),
  notes: z.string().trim().max(300).optional().default("")
});

export const spaceSchema = z.object({
  name: z.string().trim().min(1, "Space name is required.").max(40),
  icon: z.string().trim().max(8).optional().default("🗂️"),
  description: z.string().trim().max(200).optional().default(""),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #4F46E5.")
    .optional()
    .default("#4F46E5")
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long.").max(50)
});

export const updatePreferencesSchema = z.object({
  currency: z.enum(currencies).optional(),
  dateFormat: z.string().trim().max(20).optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters long.").max(72)
});

export const budgetSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format."),
  amount: z.coerce.number().positive("Budget must be greater than zero.")
});

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Goal name is required.")
    .max(80, "Goal name is too long."),
  targetAmount: z.coerce
    .number()
    .positive("Target amount must be greater than zero."),
  savedAmount: z.coerce
    .number()
    .min(0, "Saved amount cannot be negative.")
    .default(0),
  targetDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Target date must be in YYYY-MM-DD format."
    )
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(50, "Name is too long."),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(72, "Password is too long.")
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(72, "Password is too long.")
});