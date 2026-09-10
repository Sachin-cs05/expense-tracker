import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Expense } from "../models/Expense.js";
import { User } from "../models/User.js";
import { SavingsGoal } from "../models/SavingsGoal.js";
import { Income } from "../models/Income.js";
import { Category } from "../models/Category.js";
import { RecurringPayment } from "../models/RecurringPayment.js";
import { Space } from "../models/Space.js";

const getMongoUri = () => process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense-tracker";

export async function initializeDatabase() {
  await mongoose.connect(getMongoUri());
  await Promise.all([
    User.syncIndexes(),
    Expense.syncIndexes(),
    Budget.syncIndexes(),
    SavingsGoal.syncIndexes(),
    Income.syncIndexes(),
    Category.syncIndexes(),
    RecurringPayment.syncIndexes(),
    Space.syncIndexes()
  ]);
}
