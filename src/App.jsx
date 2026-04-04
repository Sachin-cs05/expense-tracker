import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { api } from "./lib/api.js";
import { ExpenseForm } from "./components/ExpenseForm.jsx";
import { ExpenseTable } from "./components/ExpenseTable.jsx";
import { FilterBar } from "./components/FilterBar.jsx";
import { SummaryCards } from "./components/SummaryCards.jsx";
import { ChartsPanel } from "./components/ChartsPanel.jsx";
import { BudgetPanel } from "./components/BudgetPanel.jsx";
import { Header } from "./components/Header.jsx";
import { AuthPanel } from "./components/AuthPanel.jsx";

const initialFilters = {
  category: "",
  month: format(new Date(), "yyyy-MM"),
  startDate: "",
  endDate: "",
  search: ""
};

const emptyForm = {
  amount: "",
  category: "Food",
  date: format(new Date(), "yyyy-MM-dd"),
  description: ""
};

const emptyAuthForm = {
  email: "",
  password: ""
};

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    month: initialFilters.month,
    amount: ""
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("expense-theme") === "dark");
  const [errorMessage, setErrorMessage] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authUser, setAuthUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.append(key, value);
      }
    });

    return params.toString();
  }, [filters]);

  useEffect(() => {
    document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("expense-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  useEffect(() => {
    const storedToken = localStorage.getItem("expense-token");

    if (!storedToken) {
      setIsAuthLoading(false);
      return;
    }

    api.setToken(storedToken);

    async function restoreSession() {
      try {
        const { user } = await api.getMe();
        setAuthUser(user);
      } catch {
        clearSession();
      } finally {
        setIsAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    async function loadInitialData() {
      try {
        const categoriesData = await api.getCategories();
        setCategories(categoriesData);
        setFormValues((current) => ({
          ...current,
          category: categoriesData[0] || "Food"
        }));
      } catch (error) {
        handleRequestError(error);
      }
    }

    loadInitialData();
  }, [authUser]);

  useEffect(() => {
    if (!authUser) {
      return;
    }

    refreshDashboard();
  }, [authUser, queryString]);

  function clearSession(message = "") {
    api.clearToken();
    localStorage.removeItem("expense-token");
    setAuthUser(null);
    setExpenses([]);
    setSummary(null);
    setDailyData([]);
    setMonthlyData([]);
    setCategoryData([]);
    setCategories([]);
    setBudgetStatus(null);
    setErrorMessage("");
    setAuthMessage(message);
    setEditingExpenseId(null);
    setFormValues(emptyForm);
    setBudgetForm({ month: initialFilters.month, amount: "" });
  }

  function handleRequestError(error) {
    if (error.status === 401) {
      clearSession("Your session expired. Please sign in again.");
      return;
    }

    setErrorMessage(error.message);
  }

  async function refreshDashboard() {
    try {
      const [expensesData, summaryData, dailyChartData, monthlyChartData, categoryChartData, budgetData] =
        await Promise.all([
          api.getExpenses(queryString),
          api.getSummary(queryString),
          api.getDailyData(queryString),
          api.getMonthlyData(),
          api.getCategoryData(queryString),
          api.getBudget(filters.month || format(new Date(), "yyyy-MM"))
        ]);

      setExpenses(expensesData);
      setSummary(summaryData);
      setDailyData(dailyChartData);
      setMonthlyData(monthlyChartData);
      setCategoryData(categoryChartData);
      setBudgetStatus(budgetData.status);
      setBudgetForm((current) => ({
        ...current,
        month: filters.month || current.month,
        amount: budgetData.budget?.amount ?? ""
      }));
      setErrorMessage("");
    } catch (error) {
      handleRequestError(error);
    }
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      if (authMode === "login") {
        const authResponse = await api.login(authForm);
        api.setToken(authResponse.token);
        localStorage.setItem("expense-token", authResponse.token);
        setAuthUser(authResponse.user);
        setAuthForm(emptyAuthForm);
        setAuthMessage("");
        setErrorMessage("");
        return;
      }

      await api.register(authForm);
      setAuthMode("login");
      setAuthForm(emptyAuthForm);
      setAuthMessage("Registration successful. Please log in.");
      setErrorMessage("");
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingExpenseId) {
        await api.updateExpense(editingExpenseId, formValues);
      } else {
        await api.createExpense(formValues);
      }

      setFormValues({
        ...emptyForm,
        category: categories[0] || "Food"
      });
      setEditingExpenseId(null);
      refreshDashboard();
    } catch (error) {
      handleRequestError(error);
    }
  }

  function handleEdit(expense) {
    setEditingExpenseId(expense.id);
    setFormValues({
      amount: String(expense.amount),
      category: expense.category,
      date: expense.date,
      description: expense.description
    });
  }

  async function handleDelete(id) {
    try {
      await api.deleteExpense(id);
      refreshDashboard();
    } catch (error) {
      handleRequestError(error);
    }
  }

  async function handleBudgetSubmit(event) {
    event.preventDefault();

    try {
      await api.saveBudget(budgetForm);
      refreshDashboard();
    } catch (error) {
      handleRequestError(error);
    }
  }

  async function handleExport(type) {
    try {
      await api.downloadReport(type, queryString);
    } catch (error) {
      handleRequestError(error);
    }
  }

  function resetForm() {
    setEditingExpenseId(null);
    setFormValues({
      ...emptyForm,
      category: categories[0] || "Food"
    });
  }

  return (
    <div className="app-shell">
      <Header
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((value) => !value)}
        onExport={handleExport}
        user={authUser}
        onLogout={() => clearSession("You have been logged out.")}
      />

      {!authUser ? (
        <main className="auth-shell">
          <AuthPanel
            authMode={authMode}
            authForm={authForm}
            authMessage={authMessage || (isAuthLoading ? "Restoring your session..." : "")}
            onModeChange={(mode) => {
              setAuthMode(mode);
              setAuthMessage("");
            }}
            onFormChange={setAuthForm}
            onSubmit={handleAuthSubmit}
          />
        </main>
      ) : (
        <main className="page-grid">
          <section className="panel hero-panel">
            <div>
              <p className="eyebrow">Expense Tracker</p>
              <h1>Stay on top of spending with real-time insights.</h1>
              <p className="hero-copy">
                Add expenses, monitor monthly budgets, and uncover patterns through interactive charts.
              </p>
            </div>
            {summary && <SummaryCards summary={summary} budgetStatus={budgetStatus} />}
          </section>

          <section className="panel">
            <ExpenseForm
              categories={categories}
              formValues={formValues}
              editingExpenseId={editingExpenseId}
              onChange={setFormValues}
              onReset={resetForm}
              onSubmit={handleSubmit}
            />
          </section>

          <section className="panel">
            <BudgetPanel
              budgetForm={budgetForm}
              budgetStatus={budgetStatus}
              onBudgetFormChange={setBudgetForm}
              onSubmit={handleBudgetSubmit}
            />
          </section>

          <section className="panel full-width">
            <FilterBar filters={filters} categories={categories} onChange={setFilters} />
          </section>

          <section className="panel chart-panel full-width">
            <ChartsPanel categoryData={categoryData} monthlyData={monthlyData} dailyData={dailyData} />
          </section>

          <section className="panel full-width">
            {errorMessage ? <p className="error-banner">{errorMessage}</p> : null}
            <ExpenseTable expenses={expenses} onEdit={handleEdit} onDelete={handleDelete} />
          </section>
        </main>
      )}
    </div>
  );
}
