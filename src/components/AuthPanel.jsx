export function AuthPanel({ authMode, authForm, authMessage, onModeChange, onFormChange, onSubmit }) {
  return (
    <section className="panel auth-panel">
      <div className="auth-copy">
        <p className="eyebrow">JWT Authentication</p>
        <h1>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="hero-copy">
          Sign in to keep your expenses, budgets, reports, and analytics isolated to your account.
        </p>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <div className="auth-switcher" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={authMode === "login" ? "primary-button" : "secondary-button"}
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={authMode === "register" ? "primary-button" : "secondary-button"}
            onClick={() => onModeChange("register")}
          >
            Register
          </button>
        </div>

        {authMode === "register" ? (
          <label>
            Full name
            <input
              type="text"
              value={authForm.name}
              onChange={(event) => onFormChange((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            type="email"
            value={authForm.email}
            onChange={(event) => onFormChange((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={authForm.password}
            onChange={(event) => onFormChange((current) => ({ ...current, password: event.target.value }))}
            placeholder="At least 8 characters"
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            required
          />
        </label>

        {authMessage ? <p className="error-banner auth-message">{authMessage}</p> : null}

        <button className="primary-button" type="submit">
          {authMode === "login" ? "Login to dashboard" : "Create account"}
        </button>
      </form>
    </section>
  );
}
