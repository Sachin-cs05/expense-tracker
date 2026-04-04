import mongoose from "mongoose";
import { Budget } from "../models/Budget.js";
import { Expense } from "../models/Expense.js";
import { User } from "../models/User.js";

const defaultMongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/expense-tracker";

export async function initializeDatabase() {
  await mongoose.connect(defaultMongoUri);
  await Promise.all([
    User.syncIndexes(),
    Expense.syncIndexes(),
    Budget.syncIndexes()
  ]);
}
