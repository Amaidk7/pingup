import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const Layout = () => {
  const user = useSelector((state) => state.user?.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDark } = useTheme();

  return user ? (
    <div className={`w-full flex h-screen ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Top Bar with Theme Toggle */}
        <div className={`flex items-center justify-end px-5 py-2.5 border-b shrink-0 ${
          isDark ? "bg-black border-white/5" : "bg-white border-slate-100"
        }`}>
          <ThemeToggle />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>

      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className={`absolute top-2.5 left-3 p-2 z-30 rounded-xl border w-10 h-10 flex items-center justify-center sm:hidden transition ${
          isDark
            ? "bg-zinc-900 border-white/10 text-white/50"
            : "bg-white border-slate-100 text-slate-500"
        }`}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={`absolute inset-0 z-10 sm:hidden ${isDark ? "bg-black/60" : "bg-black/20"}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
