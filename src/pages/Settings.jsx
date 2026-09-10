import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../lib/api.js";
import { Card, ConfirmDialog } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";

const currencies = ["INR", "USD", "EUR", "GBP"];
const dateFormats = ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"];

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { themeMode, setThemeMode } = useTheme();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "INR");
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || "yyyy-MM-dd");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      const { user: updated } = await api.updateProfile({ name });
      setUser(updated);
      showToast("Profile updated.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePreferencesSubmit(event) {
    event.preventDefault();
    setIsSavingPreferences(true);
    try {
      const { user: updated } = await api.updatePreferences({ currency, dateFormat });
      setUser(updated);
      showToast("Preferences saved.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSavingPreferences(false);
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsChangingPassword(true);
    try {
      await api.changePassword(passwordForm);
      showToast("Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    try {
      await api.deleteAccount();
      logout();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="muted-copy">Manage your profile, preferences, and account.</p>
        </div>
      </div>

      <Card>
        <div className="card-header">
          <h3>Profile</h3>
        </div>
        <form className="stack-form" onSubmit={handleProfileSubmit}>
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
          </label>
          <label>
            Email
            <input value={user?.email || ""} disabled />
          </label>
          <button type="submit" className="btn btn-primary" disabled={isSavingProfile} style={{ alignSelf: "flex-start" }}>
            {isSavingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>
      </Card>

      <Card>
        <div className="card-header">
          <h3>Appearance</h3>
        </div>
        <div className="theme-options">
          {[
            { value: "light", icon: "sun", label: "Light" },
            { value: "dark", icon: "moon", label: "Dark" },
            { value: "system", icon: "monitor", label: "System" }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`theme-option ${themeMode === option.value ? "active" : ""}`}
              onClick={() => setThemeMode(option.value)}
            >
              <Icon name={option.icon} size={20} />
              {option.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <div className="card-header">
          <h3>Preferences</h3>
        </div>
        <form className="stack-form" onSubmit={handlePreferencesSubmit}>
          <div className="form-row">
            <label>
              Currency
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {currencies.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date format
              <select value={dateFormat} onChange={(event) => setDateFormat(event.target.value)}>
                {dateFormats.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={isSavingPreferences} style={{ alignSelf: "flex-start" }}>
            {isSavingPreferences ? "Saving..." : "Save preferences"}
          </button>
        </form>
      </Card>

      <Card>
        <div className="card-header">
          <h3>Security</h3>
        </div>
        <form className="stack-form" onSubmit={handlePasswordSubmit}>
          <label>
            Current password
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((f) => ({ ...f, currentPassword: event.target.value }))}
              required
              minLength={8}
            />
          </label>
          <label>
            New password
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((f) => ({ ...f, newPassword: event.target.value }))}
              required
              minLength={8}
            />
          </label>
          <div className="row-actions">
            <button type="submit" className="btn btn-primary" disabled={isChangingPassword}>
              {isChangingPassword ? "Updating..." : "Change password"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              <Icon name="logOut" size={16} />
              Log out
            </button>
          </div>
        </form>
      </Card>

      <Card className="danger-zone">
        <div className="card-header">
          <h3>Danger Zone</h3>
        </div>
        <p className="muted-copy">Deleting your account permanently removes every expense, income entry, budget, goal, and space.</p>
        <button type="button" className="btn btn-danger" onClick={() => setIsDeleteOpen(true)}>
          Delete account
        </button>
      </Card>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete your account?"
        description="This permanently deletes your account and all associated data. This cannot be undone."
        confirmLabel="Delete account"
        onConfirm={handleDeleteAccount}
        onClose={() => setIsDeleteOpen(false)}
      />
    </div>
  );
}
