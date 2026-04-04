export function FilterBar({ filters, categories, onChange }) {
  function updateField(event) {
    const { name, value } = event.target;
    onChange((current) => ({
      ...current,
      [name]: value
    }));
  }

  function clearFilters() {
    onChange({
      category: "",
      month: "",
      startDate: "",
      endDate: "",
      search: ""
    });
  }

  return (
    <div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Filters</p>
          <h2>Search and segment expenses</h2>
        </div>
      </div>
      <div className="filter-grid">
        <label>
          Search
          <input name="search" type="search" placeholder="Search description" value={filters.search} onChange={updateField} />
        </label>
        <label>
          Category
          <select name="category" value={filters.category} onChange={updateField}>
            <option value="">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Month
          <input name="month" type="month" value={filters.month} onChange={updateField} />
        </label>
        <label>
          Start Date
          <input name="startDate" type="date" value={filters.startDate} onChange={updateField} />
        </label>
        <label>
          End Date
          <input name="endDate" type="date" value={filters.endDate} onChange={updateField} />
        </label>
        <div className="filter-actions">
          <button className="secondary-button" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
