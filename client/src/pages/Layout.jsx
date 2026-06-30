import { Menu, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
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
  const cursorRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });

  // ✅ Cursor glow effect
  useEffect(() => {
    const move = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return user ? (
    <div
      className={`w-full flex h-screen overflow-hidden relative ${isDark ? "bg-[#080810]" : "bg-[#f0f2f9]"}`}
      style={{
        background: isDark
          ? "radial-gradient(ellipse at 20% 50%, #0d0d2b 0%, #080810 60%)"
          : "radial-gradient(ellipse at 20% 50%, #e8ecf8 0%, #f0f2f9 60%)",
      }}
    >
      {/* ✅ Cursor glow */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-50 transition-opacity duration-300"
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          transform: "translate(-50%, -50%)",
          width: "400px",
          height: "400px",
          background: isDark
            ? "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />

      {/* ✅ Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div
          className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            width: "600px",
            height: "600px",
            top: "-100px",
            left: "-100px",
            background: isDark ? "#1e3a8a" : "#c7d2fe",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-10"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-100px",
            right: "200px",
            background: isDark ? "#0e7490" : "#bfdbfe",
            animation: "pulse 4s ease-in-out infinite 2s",
          }}
        />
      </div>

      <div className="relative z-10 flex w-full h-full">
        {/* z-30 → sidebar overlay (z-20) ke upar rahega */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div
            className={`flex items-center justify-end px-5 py-2.5 border-b shrink-0 backdrop-blur-sm ${
              isDark
                ? "bg-black/20 border-white/5"
                : "bg-white/50 border-slate-200/60"
            }`}
          >
            <ThemeToggle />
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-hidden">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile menu toggle — z-40 so always on top */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className={`absolute top-2.5 left-3 p-2 z-40 rounded-xl border w-10 h-10 flex items-center justify-center sm:hidden transition ${
          isDark
            ? "bg-zinc-900 border-white/10 text-white/50"
            : "bg-white border-slate-100 text-slate-500"
        }`}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay — z-20 so sidebar (z-30) ke neeche rahega */}
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
