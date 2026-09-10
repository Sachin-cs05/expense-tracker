export const mainNavItems = [
  { to: "/dashboard", label: "Overview", icon: "home" },
  { to: "/expenses", label: "Expenses", icon: "wallet" },
  { to: "/income", label: "Income", icon: "trendingUp" },
  { to: "/analytics", label: "Analytics", icon: "barChart" },
  { to: "/budgets", label: "Budgets", icon: "target" },
  { to: "/savings", label: "Savings Goals", icon: "piggyBank" },
  { to: "/recurring", label: "Recurring", icon: "repeat" },
  { to: "/categories", label: "Categories", icon: "tag" },
  { to: "/spaces", label: "Spaces", icon: "grid" }
];

export const toolsNavItems = [{ to: "/data", label: "Import / Export", icon: "upload" }];

export const systemNavItems = [{ to: "/settings", label: "Settings", icon: "settings" }];

// A compact subset shown on the mobile bottom navigation.
export const mobileNavItems = [
  { to: "/dashboard", label: "Overview", icon: "home" },
  { to: "/expenses", label: "Expenses", icon: "wallet" },
  { to: "/analytics", label: "Analytics", icon: "barChart" },
  { to: "/budgets", label: "Budgets", icon: "target" },
  { to: "/settings", label: "Settings", icon: "settings" }
];
