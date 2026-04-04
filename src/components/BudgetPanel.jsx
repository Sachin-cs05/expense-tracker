export function BudgetPanel({ budgetForm, budgetStatus, onBudgetFormChange, onSubmit }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onBudgetFormChange((current) => ({
      ...current,
      [name]: value
    }));
  }

  return (
    <div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Budget Control</p>
          <h2>Set a monthly budget</h2>
        </div>
      </div>
      <form className="budget-form" onSubmit={onSubmit}>
        <label>
          Month
          <input type="month" name="month" value={budgetForm.month} onChange={handleChange} required />
        </label>
        <label>
          Budget Amount
          <input type="number" name="amount" min="0" step="0.01" value={budgetForm.amount} onChange={handleChange} required />
        </label>
        <button className="primary-button" type="submit">
          Save Budget
        </button>
      </form>
      {budgetStatus ? (
        <div className={`budget-status ${budgetStatus.exceeded ? "danger" : "safe"}`}>
          <p>
            <strong>{budgetStatus.month}</strong> spent: {"\u20B9"}{budgetStatus.spent.toFixed(2)}
          </p>
          <p>
            {budgetStatus.exceeded
              ? `Budget exceeded by \u20B9${Math.abs(budgetStatus.remaining).toFixed(2)}`
              : `Remaining budget: \u20B9${budgetStatus.remaining.toFixed(2)}`}
          </p>
        </div>
      ) : (
        <p className="muted-copy">No budget set for the selected month yet.</p>
      )}
    </div>
  );
}

