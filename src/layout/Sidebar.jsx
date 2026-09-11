import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { mainNavItems, systemNavItems, toolsNavItems } from "./navConfig.js";

const themeOptions = [
  { value: "light", icon: "sun", label: "Light" },
  { value: "dark", icon: "moon", label: "Dark" },
  { value: "system", icon: "monitor", label: "System" }
];

export function Sidebar({ user, isOpen, onClose }) {
  const { themeMode, setThemeMode } = useTheme();

  function renderLink(item) {
    return (
      <NavLink
        key={item.to}
        to={item.to}
        onClick={onClose}
        className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      >
        <Icon name={item.icon} size={18} />
        <span>{item.label}</span>
      </NavLink>
    );
  }

  return (
    <>
      {isOpen ? <div className="sidebar-scrim" onClick={onClose} /> : null}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">FT</div>
          <div>
            <p className="sidebar-brand-name">FinTrack</p>
            <p className="sidebar-brand-tag">Personal finance</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Main</p>
          {mainNavItems.map(renderLink)}

          <div className="sidebar-divider" />
          <p className="sidebar-section-label">Tools</p>
          {toolsNavItems.map(renderLink)}

          <div className="sidebar-divider" />
          <p className="sidebar-section-label">System</p>
          {systemNavItems.map(renderLink)}
        </nav>

        <div className="sidebar-footer">
          <div className="theme-switch" role="group" aria-label="Theme">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`theme-switch-btn ${themeMode === option.value ? "active" : ""}`}
                onClick={() => setThemeMode(option.value)}
                title={option.label}
                aria-label={option.label}
              >
                <Icon name={option.icon} size={15} />
              </button>
            ))}
          </div>
          <div className="sidebar-user">
            <div className="avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "?"
              )}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user?.name}</p>
              <p className="sidebar-user-email">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
