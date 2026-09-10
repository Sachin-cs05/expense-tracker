import { useState } from "react";
import { Icon } from "../../ui/Icon.jsx";
import { ExpenseFormModal } from "../forms/ExpenseFormModal.jsx";
import { IncomeFormModal } from "../forms/IncomeFormModal.jsx";
import { BudgetFormModal } from "../forms/BudgetFormModal.jsx";
import { SavingsGoalFormModal } from "../forms/SavingsGoalFormModal.jsx";
import { RecurringFormModal } from "../forms/RecurringFormModal.jsx";
import { CategoryFormModal } from "../forms/CategoryFormModal.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const options = [
  { key: "expense", label: "Expense", icon: "wallet" },
  { key: "income", label: "Income", icon: "trendingUp" },
  { key: "budget", label: "Budget", icon: "target" },
  { key: "goal", label: "Savings Goal", icon: "piggyBank" },
  { key: "recurring", label: "Recurring Payment", icon: "repeat" },
  { key: "category", label: "Category", icon: "tag" }
];

export function QuickAddMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const { refreshCategories } = useAppData();

  function openModal(key) {
    setActiveModal(key);
    setIsMenuOpen(false);
  }

  return (
    <div className="quick-add">
      <button type="button" className="btn btn-primary" onClick={() => setIsMenuOpen((value) => !value)}>
        <Icon name="plus" size={16} />
        Add
      </button>

      {isMenuOpen ? (
        <>
          <div className="menu-scrim" onClick={() => setIsMenuOpen(false)} />
          <div className="quick-add-menu">
            {options.map((option) => (
              <button key={option.key} type="button" className="quick-add-item" onClick={() => openModal(option.key)}>
                <Icon name={option.icon} size={16} />
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <ExpenseFormModal isOpen={activeModal === "expense"} onClose={() => setActiveModal(null)} />
      <IncomeFormModal isOpen={activeModal === "income"} onClose={() => setActiveModal(null)} />
      <BudgetFormModal isOpen={activeModal === "budget"} onClose={() => setActiveModal(null)} />
      <SavingsGoalFormModal isOpen={activeModal === "goal"} onClose={() => setActiveModal(null)} />
      <RecurringFormModal isOpen={activeModal === "recurring"} onClose={() => setActiveModal(null)} />
      <CategoryFormModal
        isOpen={activeModal === "category"}
        onClose={() => setActiveModal(null)}
        onSaved={refreshCategories}
      />
    </div>
  );
}
