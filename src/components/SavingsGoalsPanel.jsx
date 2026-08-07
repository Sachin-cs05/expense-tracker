export function SavingsGoalsPanel({ goals, formValues, onFormChange, onSubmit, onDelete }) {
  function handleChange(event) {
    const { name, value } = event.target;
    onFormChange((current) => ({ ...current, [name]: value }));
  }

  return (
    <div>
      <div className="section-heading"><div><p className="eyebrow">Savings Goals</p><h2>Plan ahead</h2></div></div>
      <form className="goal-form" onSubmit={onSubmit}>
        <input name="name" placeholder="Goal name" value={formValues.name} onChange={handleChange} required />
        <input name="targetAmount" type="number" min="1" placeholder="Target amount" value={formValues.targetAmount} onChange={handleChange} required />
        <input name="savedAmount" type="number" min="0" placeholder="Already saved" value={formValues.savedAmount} onChange={handleChange} />
        <input name="targetDate" type="date" value={formValues.targetDate} onChange={handleChange} required />
        <button className="primary-button" type="submit">Save Goal</button>
      </form>
      <div className="goal-list">
        {goals.map((goal) => {
          const progress = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
          return <div className="goal-item" key={goal.id}><div><strong>{goal.name}</strong><span>₹{goal.savedAmount.toFixed(2)} of ₹{goal.targetAmount.toFixed(2)}</span><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div><button className="ghost-button small" type="button" onClick={() => onDelete(goal.id)}>Remove</button></div>;
        })}
        {!goals.length ? <p className="muted-copy">Create a goal to keep savings visible.</p> : null}
      </div>
    </div>
  );
}
