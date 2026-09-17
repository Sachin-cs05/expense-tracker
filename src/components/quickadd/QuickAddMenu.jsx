import { useState } from "react";
import { Icon } from "../../ui/Icon.jsx";
import { ExpenseFormModal } from "../forms/ExpenseFormModal.jsx";
import { IncomeFormModal } from "../forms/IncomeFormModal.jsx";
import { BudgetFormModal } from "../forms/BudgetFormModal.jsx";
import { SavingsGoalFormModal } from "../forms/SavingsGoalFormModal.jsx";
import { RecurringFormModal } from "../forms/RecurringFormModal.jsx";
import { CategoryFormModal } from "../forms/CategoryFormModal.jsx";
import { VoiceExpenseModal } from "../voice/VoiceExpenseModal.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const options = [
  { key: "voice", label: "Voice Expense", icon: "mic" },
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
  const [prefilledExpense, setPrefilledExpense] = useState(null);
  const { refreshCategories } = useAppData();

  function openModal(key) {
    if (key !== "expense") {
      setPrefilledExpense(null);
    }
    setActiveModal(key);
    setIsMenuOpen(false);
  }

  function handleVoiceEdit(expense) {
    setPrefilledExpense(expense);
    setActiveModal("expense");
  }

  return (
    <div className="quick-add">
      <button
        type="button"
        className="btn btn-secondary voice-quick-btn"
        onClick={() => openModal("voice")}
        title="Add Expense with Voice"
        aria-label="Add expense with voice"
      >
        <Icon name="mic" size={16} />
        <span className="voice-btn-label">Voice Entry</span>
      </button>

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

      <VoiceExpenseModal
        isOpen={activeModal === "voice"}
        onClose={() => setActiveModal(null)}
        onOpenEditForm={handleVoiceEdit}
      />
      <ExpenseFormModal
        isOpen={activeModal === "expense"}
        onClose={() => {
          setActiveModal(null);
          setPrefilledExpense(null);
        }}
        expense={prefilledExpense}
      />
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
