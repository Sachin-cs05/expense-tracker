export function ExpenseForm({ categories, formValues, editingExpenseId, onChange, onReset, onSubmit }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onChange((current) => ({
      ...current,
      [name]: value
    }));
  }

  return (
    <div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Expense Entry</p>
          <h2>{editingExpenseId ? "Edit expense" : "Add a new expense"}</h2>
        </div>
      </div>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Amount
          <input name="amount" type="number" min="0" step="0.01" value={formValues.amount} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={formValues.category} onChange={handleChange} required>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input name="date" type="date" value={formValues.date} onChange={handleChange} required />
        </label>
        <label className="full-span">
          Description
          <input
            name="description"
            type="text"
            maxLength="120"
            placeholder="What did you spend on?"
            value={formValues.description}
            onChange={handleChange}
            required
          />
        </label>
        <div className="form-actions full-span">
          <button className="primary-button" type="submit">
            {editingExpenseId ? "Update Expense" : "Save Expense"}
          </button>
          {editingExpenseId ? (
            <button className="secondary-button" type="button" onClick={onReset}>
              Cancel Edit
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
