import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const refreshCategories = useCallback(async () => {
    const [expenseCats, incomeCats] = await Promise.all([
      api.getCategories("expense"),
      api.getCategories("income")
    ]);
    setExpenseCategories(expenseCats);
    setIncomeCategories(incomeCats);
  }, []);

  const refreshSpaces = useCallback(async () => {
    setSpaces(await api.getSpaces());
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
