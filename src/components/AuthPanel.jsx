import { useEffect, useState } from "react";

function LedgerBloomMark() {
  return <span className="ledger-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 24V10.5C7 9.67 7.67 9 8.5 9h15c.83 0 1.5.67 1.5 1.5V24M7 24h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M11 20v-4M16 20v-7M21 20v-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><path d="M22.2 7.1c.55-1.35 1.71-2.27 3.23-2.58-.07 1.58-.8 2.8-2.18 3.38" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg></span>;
}

function PasswordField({ label, value, onChange, autoComplete, error }) {
  const [visible, setVisible] = useState(false);
  const id = label.toLowerCase().replaceAll(" ", "-");
  return <div className="auth-field"><label htmlFor={id}>{label}</label><div className="password-control"><input id={id} type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder="At least 8 characters" autoComplete={autoComplete} required /><button type="button" className="password-visibility" onClick={() => setVisible((current) => !current)} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>{visible ? "◉" : "◌"}</button></div>{error ? <p className="field-error" role="alert">{error}</p> : null}</div>;
}

function ExpensePreview() {
  const spending = [34, 58, 43, 75, 53, 86, 64];
  return <div className="expense-preview" aria-label="Example August spending summary"><div className="preview-heading"><span>August overview</span><span className="preview-more">•••</span></div><strong>₹24,680</strong><p>Total spending · August</p><div className="mini-chart" aria-hidden="true">{spending.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="preview-list"><span><i className="food-dot" />Food <b>₹4,820</b></span><span><i className="travel-dot" />Travel <b>₹2,340</b></span><span><i className="shopping-dot" />Shopping <b>₹3,120</b></span></div><div className="savings-progress"><span>Monthly savings</span><b>68%</b><i><em /></i></div></div>;
}

export function AuthPanel({ authMode, authForm, authMessage, isDarkMode, onModeChange, onFormChange, onSubmit, onToggleTheme }) {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formError, setFormError] = useState("");
  const register = authMode === "register";
  useEffect(() => { setConfirmPassword(""); setAgreedToTerms(false); setFormError(""); }, [authMode]);
  function switchMode(mode) { if (mode !== authMode) onModeChange(mode); }
  function submit(event) {
    if (register && authForm.password !== confirmPassword) { event.preventDefault(); setFormError("Passwords do not match."); return; }
    if (register && !agreedToTerms) { event.preventDefault(); setFormError("Please agree to the Terms and Privacy Policy."); return; }
    setFormError(""); onSubmit(event);
  }
  const messageClass = authMessage?.toLowerCase().includes("successful") ? "success" : "error";
  return <section className="auth-experience">
    <aside className="auth-brand-section"><div className="showcase-orbit orbit-one" /><div className="showcase-orbit orbit-two" /><div className="showcase-label">Your money, in focus</div><div className="brand-intro"><p className="auth-kicker">LEDGER BLOOM · AUGUST</p><h1>A clearer way to grow your financial life.</h1><p>Small decisions become better habits when every expense has a place.</p></div><ExpensePreview /><p className="brand-note">Personal finance, thoughtfully organized.</p></aside>
    <section className="auth-surface" aria-label={register ? "Create an account" : "Sign in"}><div className="auth-surface-top"><div className="auth-mobile-brand"><LedgerBloomMark /><span>Ledger Bloom</span></div><button type="button" className="auth-theme-toggle" onClick={onToggleTheme} aria-label={isDarkMode ? "Switch to light theme" : "Switch to dark theme"} title={isDarkMode ? "Switch to light theme" : "Switch to dark theme"}>{isDarkMode ? "☀" : "☾"}</button></div><div className="auth-brand form-brand"><LedgerBloomMark /><span>Ledger Bloom</span></div><div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button type="button" role="tab" aria-selected={!register} className={!register ? "active" : ""} onClick={() => switchMode("login")}>Login</button><button type="button" role="tab" aria-selected={register} className={register ? "active" : ""} onClick={() => switchMode("register")}>Register</button></div><div className="auth-copy"><h2>{register ? "Build better money habits." : "Welcome back."}</h2><p>{register ? "Create your Ledger Bloom account and start understanding where your money goes." : "Take control of your spending and keep your finances organized."}</p></div>
      <form className="auth-form" onSubmit={submit}>{register ? <div className="auth-field"><label htmlFor="full-name">Full name</label><input id="full-name" type="text" value={authForm.name} onChange={(event) => onFormChange((current) => ({ ...current, name: event.target.value }))} placeholder="Your full name" autoComplete="name" required /></div> : null}<div className="auth-field"><label htmlFor="email">Email address</label><input id="email" type="email" value={authForm.email} onChange={(event) => onFormChange((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" autoComplete="email" required /></div><PasswordField label="Password" value={authForm.password} onChange={(event) => onFormChange((current) => ({ ...current, password: event.target.value }))} autoComplete={register ? "new-password" : "current-password"} />{register ? <PasswordField label="Confirm password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); setFormError(""); }} autoComplete="new-password" error={formError === "Passwords do not match." ? formError : ""} /> : null}{!register ? <button type="button" className="forgot-password">Forgot password?</button> : null}{register ? <label className="terms-check"><input type="checkbox" checked={agreedToTerms} onChange={(event) => { setAgreedToTerms(event.target.checked); setFormError(""); }} /><span>I agree to the <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a></span></label> : null}{formError && formError !== "Passwords do not match." ? <p className="auth-feedback error" role="alert">{formError}</p> : null}{authMessage ? <p className={`auth-feedback ${messageClass}`} role="alert">{authMessage}</p> : null}<button className="auth-submit" type="submit">{register ? "Create account" : <>Sign in <span aria-hidden="true">→</span></>}</button></form>
      <p className="auth-switch-copy">{register ? "Already have an account?" : "New to Ledger Bloom?"} <button type="button" onClick={() => switchMode(register ? "login" : "register")}>{register ? "Sign in →" : "Create an account →"}</button></p><footer className="auth-footer"><span>© 2026 Ledger Bloom</span><a id="privacy" href="#privacy">Privacy</a><a id="terms" href="#terms">Terms</a></footer></section>
  </section>;
}
