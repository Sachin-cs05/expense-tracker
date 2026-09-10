import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Card, ConfirmDialog, EmptyState, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { CategoryFormModal } from "../components/forms/CategoryFormModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Categories() {
  const { expenseCategories, incomeCategories, refreshCategories } = useAppData();
  const { showToast } = useToast();
  const [type, setType] = useState("expense");
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [expenseList, incomeList] = await Promise.all([api.getExpenses(), api.getIncomes()]);
      setExpenses(expenseList);
      setIncomes(incomeList);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const source = type === "expense" ? expenses : incomes;
    const map = new Map();
    source.forEach((item) => {
      const current = map.get(item.category) || { count: 0, total: 0 };
      current.count += 1;
      current.total += item.amount;
      map.set(item.category, current);
    });
    return map;
  }, [type, expenses, incomes]);

  const categories = type === "expense" ? expenseCategories : incomeCategories;

  async function handleDelete(id) {
    try {
      await api.deleteCategory(id);
      showToast("Category removed.");
      refreshCategories();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p className="muted-copy">Organize your transactions your own way.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
          <Icon name="plus" size={16} />
          Create Category
        </button>
      </div>

      <div className="tab-row">
        <button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>
          Expense categories
        </button>
        <button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>
          Income categories
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : categories.length ? (
        <div className="category-grid">
          {categories.map((category) => {
            const stat = stats.get(category.name) || { count: 0, total: 0 };
            return (
              <Card className="category-card" key={category.id}>
                <div className="category-card-head">
                  <span className="category-icon-badge" style={{ background: `${category.color}22`, color: category.color }}>
                    {category.icon}
                  </span>
                  <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(category.id)} aria-label="Delete category">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
                <h3>{category.name}</h3>
                <p className="muted-copy">{stat.count} transactions</p>
                <p className="summary-card-value">{formatCurrency(stat.total)}</p>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState icon="tag" title="No categories yet" description="Create your first category to start organizing transactions." actionLabel="Create Category" onAction={() => setIsFormOpen(true)} />
        </Card>
      )}

      <CategoryFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={refreshCategories} defaultType={type} />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete category?"
        description="Existing transactions keep their category label — this only removes it from the picker."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
