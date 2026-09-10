import { Expense } from "../models/Expense.js";
import { Income } from "../models/Income.js";
import { Budget } from "../models/Budget.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { Category } from "../models/Category.js";
import { RecurringPayment } from "../models/RecurringPayment.js";
import { Space } from "../models/Space.js";

export async function deleteAllForOwner(ownerId) {
  await Promise.all([
    Expense.deleteMany({ ownerId }),
    Income.deleteMany({ ownerId }),
    Budget.deleteMany({ ownerId }),
    SavingsGoal.deleteMany({ ownerId }),
    Category.deleteMany({ ownerId }),
    RecurringPayment.deleteMany({ ownerId }),
    Space.deleteMany({ ownerId })
  ]);
}
