import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Icon } from "../ui/Icon.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const { resolvedTheme, setThemeMode } = useTheme();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (mode === "register") {
        await register(form);
        showToast("Account created — you're all set to log in.");
        setMode("login");
        setForm((current) => ({ ...current, password: "" }));
      } else {
        await login({ email: form.email, password: form.password });
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSocialLogin(provider) {
    showToast(`${provider} login: connecting...`);
    setForm((current) => ({
      ...current,
      email: current.email || "sachin@fintrack.app",
      password: current.password || "demo1234"
    }));
  }

  function handleForgotPassword() {
    showToast("Password reset instructions have been sent to your email.");
  }

  return (
    <div className="auth-split-layout">
      {/* ================= LEFT 50%: BRAND & VISUAL SECTION ================= */}
      <section className="auth-brand-section" aria-label="FinTrack overview">
        {/* Ambient atmospheric lighting */}
        <div className="auth-brand-ambient-glow" aria-hidden="true" />

        <div className="auth-brand-content">
          {/* Top Logo */}
          <div className="auth-brand-top">
            <div className="auth-brand-logo-wrap">
              <span className="auth-brand-leaf-icon">
                <Icon name="leaf" size={22} />
              </span>
              <span className="auth-brand-wordmark">FinTrack</span>
            </div>
            <p className="auth-brand-tagline">Personal Finance, Made Simple.</p>
          </div>

          {/* Hero Typography */}
          <div className="auth-hero-copy">
            <h1 className="auth-main-headline">
              Take control of <br />
              <span className="auth-headline-highlight">your finances</span>
            </h1>
            <p className="auth-main-desc">
              Track expenses, manage budgets, achieve goals and build a better financial future — all in one place.
            </p>
          </div>

          {/* 4 Feature Items */}
          <div className="auth-feature-items">
            <div className="auth-feature-pill">
              <div className="auth-feature-pill-icon">
                <Icon name="barChart" size={17} />
              </div>
              <div className="auth-feature-pill-text">
                <span className="auth-feature-pill-title">Track</span>
                <span className="auth-feature-pill-desc">Monitor your income & expenses</span>
              </div>
            </div>

            <div className="auth-feature-pill">
              <div className="auth-feature-pill-icon">
                <Icon name="target" size={17} />
              </div>
              <div className="auth-feature-pill-text">
                <span className="auth-feature-pill-title">Plan</span>
                <span className="auth-feature-pill-desc">Set budgets and savings goals</span>
              </div>
            </div>

            <div className="auth-feature-pill">
              <div className="auth-feature-pill-icon">
                <Icon name="trendingUp" size={17} />
              </div>
              <div className="auth-feature-pill-text">
                <span className="auth-feature-pill-title">Analyze</span>
                <span className="auth-feature-pill-desc">Get insights into your spending</span>
              </div>
            </div>

            <div className="auth-feature-pill">
              <div className="auth-feature-pill-icon">
                <Icon name="shield" size={17} />
              </div>
              <div className="auth-feature-pill-text">
                <span className="auth-feature-pill-title">Grow</span>
                <span className="auth-feature-pill-desc">Build better money habits</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics & Quote */}
          <div className="auth-brand-bottom">
            <div className="auth-trust-strip">
              <div className="auth-trust-stat">
                <span className="auth-stat-value">10K+</span>
                <span className="auth-stat-label">Active Users</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-trust-stat">
                <span className="auth-stat-value">4.8 ★</span>
                <span className="auth-stat-label">User Rating</span>
              </div>
              <div className="auth-stat-divider" />
              <div className="auth-trust-stat">
                <span className="auth-stat-value">100%</span>
                <span className="auth-stat-label">Secure & Private</span>
              </div>
            </div>

            <div className="auth-handwritten-note">
              Small steps. <em>Big Financial Freedom.</em>
            </div>
          </div>
        </div>

        {/* Integrated 3D Finance Visual with Soft Feathered Edges */}
        <div className="auth-visual-ambient-container" aria-hidden="true">
          <div className="auth-visual-radial-fade">
            <img
              src="/hero-phone-hd.jpg"
              alt=""
              className="auth-blended-visual-img"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Subtle playful doodle note on top of visual */}
          <div className="auth-floating-doodle">
            <span>Plan today for a better tomorrow</span>
            <svg width="28" height="24" viewBox="0 0 28 24" fill="none" stroke="currentColor">
              <path
                d="M4 14c7 9 16 9 20-3M19 14l5-3-1-5"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* ================= RIGHT 50%: AUTHENTICATION FORM ================= */}
      <section className="auth-form-section" aria-label="Sign in or register">
        {/* Top Right Theme Toggle */}
        <header className="auth-top-header">
          <button
            type="button"
            className="auth-theme-toggle-pill"
            onClick={() => setThemeMode(resolvedTheme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            <Icon name={resolvedTheme === "dark" ? "sun" : "moon"} size={15} />
            <span>{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
        </header>

        {/* Centered Auth Content (No Giant Floating Card!) */}
        <div className="auth-form-center">
          {/* Form Header */}
          <div className="auth-form-header">
            <div className="auth-form-brand-row">
              <span className="auth-form-leaf-icon">
                <Icon name="leaf" size={20} />
              </span>
              <span className="auth-form-brand-name">FinTrack</span>
            </div>
            <h2 className="auth-form-welcome">
              {mode === "login" ? "Welcome back!" : "Create an account"}
            </h2>
            <p className="auth-form-subtext">
              {mode === "login"
                ? "Log in to continue your journey to better finances."
                : "Join FinTrack to start taking control of your finances."}
            </p>
          </div>

          {/* Segmented Tab Control */}
          <div className="auth-segmented-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={`auth-segment-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={`auth-segment-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => {
                setMode("register");
                setErrorMessage("");
              }}
            >
              Create account
            </button>
          </div>

          {/* Input Form */}
          <form className="auth-interactive-form" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="auth-form-alert">
                <Icon name="alertTriangle" size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === "register" && (
              <div className="auth-input-block">
                <label htmlFor="auth-field-name" className="auth-input-label">
                  Full name
                </label>
                <div className="auth-input-field-wrap">
                  <span className="auth-input-icon">
                    <Icon name="user" size={17} />
                  </span>
                  <input
                    id="auth-field-name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={updateField}
                    required
                    minLength={2}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="auth-input-block">
              <label htmlFor="auth-field-email" className="auth-input-label">
                Email
              </label>
              <div className="auth-input-field-wrap">
                <span className="auth-input-icon">
                  <Icon name="mail" size={17} />
                </span>
                <input
                  id="auth-field-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={updateField}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-input-block">
              <label htmlFor="auth-field-password" className="auth-input-label">
                Password
              </label>
              <div className="auth-input-field-wrap">
                <span className="auth-input-icon">
                  <Icon name="lock" size={17} />
                </span>
                <input
                  id="auth-field-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField}
                  required
                  minLength={8}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="auth-password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={17} />
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="auth-forgot-link-row">
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-action-btn"
              disabled={isSubmitting}
            >
              <span>
                {isSubmitting
                  ? "Please wait..."
                  : mode === "register"
                  ? "Create account"
                  : "Log in"}
              </span>
              <Icon name="arrowRight" size={16} />
            </button>
          </form>

          {/* Clean Divider */}
          <div className="auth-clean-divider">
            <span>OR</span>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="auth-social-button-row">
            <button
              type="button"
              className="auth-social-secondary-btn"
              onClick={() => handleSocialLogin("Google")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="auth-social-secondary-btn"
              onClick={() => handleSocialLogin("GitHub")}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
                />
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Footer Mode Switch */}
          <footer className="auth-form-footer-nav">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  className="auth-footer-link-highlight"
                  onClick={() => {
                    setMode("register");
                    setErrorMessage("");
                  }}
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-footer-link-highlight"
                  onClick={() => {
                    setMode("login");
                    setErrorMessage("");
                  }}
                >
                  Log in
                </button>
              </p>
            )}
          </footer>
        </div>
      </section>
    </div>
  );
}
