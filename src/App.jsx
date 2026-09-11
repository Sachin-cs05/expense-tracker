import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { AppDataProvider } from "./context/AppDataContext.jsx";
import { AppShell } from "./layout/AppShell.jsx";
import { ProtectedRoute } from "./layout/ProtectedRoute.jsx";

import Login from "./pages/Login.jsx";
import Overview from "./pages/Overview.jsx";
import Expenses from "./pages/Expenses.jsx";
import Income from "./pages/Income.jsx";
import Analytics from "./pages/Analytics.jsx";
import Budgets from "./pages/Budgets.jsx";
import Savings from "./pages/Savings.jsx";
import Recurring from "./pages/Recurring.jsx";
import Categories from "./pages/Categories.jsx";
import Spaces from "./pages/Spaces.jsx";
import DataManagement from "./pages/DataManagement.jsx";
import Settings from "./pages/Settings.jsx";
import AiAssistant from "./pages/AiAssistant.jsx";

function LoginRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppDataProvider>
              <Routes>
                <Route path="/login" element={<LoginRoute />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Overview />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/income" element={<Income />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/savings" element={<Savings />} />
                  <Route path="/recurring" element={<Recurring />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/spaces" element={<Spaces />} />
                  <Route path="/data" element={<DataManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/ai-assistant" element={<AiAssistant />} />
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppDataProvider>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
