import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const AppDataContext = createContext(null);

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "default-food", name: "Food", icon: "🍔", color: "#F59E0B" },
  { id: "default-travel", name: "Travel", icon: "🚗", color: "#0EA5E9" },
  { id: "default-shopping", name: "Shopping", icon: "🛍️", color: "#EC4899" },
  { id: "default-bills", name: "Bills", icon: "💡", color: "#EF4444" },
  { id: "default-entertainment", name: "Entertainment", icon: "🎬", color: "#8B5CF6" },
  { id: "default-health", name: "Health", icon: "🏥", color: "#10B981" }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: "default-salary", name: "Salary", icon: "💼", color: "#10B981" },
  { id: "default-freelance", name: "Freelance", icon: "🧑‍💻", color: "#4F46E5" },
  { id: "default-investment", name: "Investment", icon: "📈", color: "#06B6D4" },
  { id: "default-gift", name: "Gift", icon: "🎁", color: "#F59E0B" },
  { id: "default-other", name: "Other", icon: "➕", color: "#6B7280" }
];

export const DEFAULT_SPACES = [
  { id: "default-space-personal", name: "Personal", icon: "🏠", color: "#10B981", description: "Everyday personal expenses", totals: { totalExpenses: 0, totalIncome: 0 } },
  { id: "default-space-work", name: "Work", icon: "💼", color: "#4F46E5", description: "Work & business expenses", totals: { totalExpenses: 0, totalIncome: 0 } },
  { id: "default-space-travel", name: "Travel & Trips", icon: "✈️", color: "#0EA5E9", description: "Vacation & trip spending", totals: { totalExpenses: 0, totalIncome: 0 } },
  { id: "default-space-family", name: "Family", icon: "👨‍👩‍👧‍👦", color: "#EC4899", description: "Shared family expenses", totals: { totalExpenses: 0, totalIncome: 0 } }
];

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState(DEFAULT_INCOME_CATEGORIES);
  const [spaces, setSpaces] = useState(DEFAULT_SPACES);
  const [isReady, setIsReady] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      let [expenseCats, incomeCats] = await Promise.all([
        api.getCategories("expense"),
        api.getCategories("income")
      ]);
      if (!expenseCats || expenseCats.length === 0) expenseCats = DEFAULT_EXPENSE_CATEGORIES;
      if (!incomeCats || incomeCats.length === 0) incomeCats = DEFAULT_INCOME_CATEGORIES;
      setExpenseCategories(expenseCats);
      setIncomeCategories(incomeCats);
    } catch {
      setExpenseCategories(DEFAULT_EXPENSE_CATEGORIES);
      setIncomeCategories(DEFAULT_INCOME_CATEGORIES);
    }
  }, []);

  const refreshSpaces = useCallback(async () => {
    try {
      let fetchedSpaces = await api.getSpaces();
      if (!fetchedSpaces || fetchedSpaces.length === 0) fetchedSpaces = DEFAULT_SPACES;
      setSpaces(fetchedSpaces);
    } catch {
      setSpaces(DEFAULT_SPACES);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setExpenseCategories([]);
      setIncomeCategories([]);
      setSpaces([]);
      setIsReady(false);
      return;
    }

    (async () => {
      try {
        await Promise.all([refreshCategories(), refreshSpaces()]);
      } finally {
        setIsReady(true);
      }
    })();
  }, [user, refreshCategories, refreshSpaces]);

  const value = useMemo(
    () => ({
      expenseCategories,
      incomeCategories,
      spaces,
      isReady,
      refreshCategories,
      refreshSpaces
    }),
    [expenseCategories, incomeCategories, spaces, isReady, refreshCategories, refreshSpaces]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within an AppDataProvider");
  return context;
}
