export function ExpenseTable({ expenses, onEdit, onDelete }) {
  return (
    <div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Expenses</p>
          <h2>Track every transaction</h2>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length ? (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>
                    <span className={`tag tag-${expense.category.toLowerCase()}`}>{expense.category}</span>
                  </td>
                  <td>{"\u20B9"}{expense.amount.toFixed(2)}</td>
                  <td className="action-cell">
                    <button className="secondary-button small" type="button" onClick={() => onEdit(expense)}>
                      Edit
                    </button>
                    <button className="ghost-button small" type="button" onClick={() => onDelete(expense.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No expenses match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


