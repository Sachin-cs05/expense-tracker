export function Header({ isDarkMode, onToggleTheme, onExport, user, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <p className="brand-mark">Ledger Bloom</p>
        <p className="brand-subtitle">Smart expense management with analytics</p>
      </div>
      <div className="topbar-actions">
        {user ? <span className="user-pill">{user.email}</span> : null}
        {user ? (
          <>
            <button className="secondary-button" onClick={() => onExport("csv")}>
              Export CSV
            </button>
            <button className="secondary-button" onClick={() => onExport("excel")}>
              Export Excel
            </button>
            <button className="ghost-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : null}
        <button className="theme-toggle" onClick={onToggleTheme}>
          {isDarkMode ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </header>
  );
}
