import { NavLink } from "react-router-dom";
import { Icon } from "../ui/Icon.jsx";
import { mobileNavItems } from "./navConfig.js";

export function MobileNav() {
  return (
    <nav className="mobile-nav">
      {mobileNavItems.map((item) => (
        <NavLink key={item.to} to={item.to} className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}>
          <Icon name={item.icon} size={20} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
