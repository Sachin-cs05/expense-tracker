import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { QuickAddMenu } from "../components/quickadd/QuickAddMenu.jsx";
import { mainNavItems, systemNavItems, toolsNavItems } from "./navConfig.js";

const allItems = [...mainNavItems, ...toolsNavItems, ...systemNavItems];

export function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const current = allItems.find((item) => location.pathname.startsWith(item.to));

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button mobile-only" onClick={onMenuClick} aria-label="Open menu">
          <Icon name="grid" size={20} />
        </button>
        <h1 className="topbar-title">{current?.label || "FinTrack"}</h1>
      </div>

      <div className="topbar-actions">
        <QuickAddMenu />
        <div className="user-menu">
          <button type="button" className="avatar avatar-button" onClick={() => setShowUserMenu((value) => !value)}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="avatar-img" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || "?"
            )}
          </button>
          {showUserMenu ? (
            <div className="user-menu-dropdown" onMouseLeave={() => setShowUserMenu(false)}>
              <p className="user-menu-name">{user?.name}</p>
              <p className="user-menu-email">{user?.email}</p>
              <button type="button" className="user-menu-item" onClick={logout}>
                <Icon name="logOut" size={16} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
