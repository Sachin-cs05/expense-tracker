import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Header } from "./Header.jsx";
import { MobileNav } from "./MobileNav.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { PageTransition } from "../ui/PageTransition.jsx";

export function AppShell() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar user={user} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="app-content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
