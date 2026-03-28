import { Menu, X } from "lucide-react";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";
import { useSelector } from "react-redux";

const Layout = () => {
  const user = useSelector((state) => state.user?.value);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return user ? (
    <div className="w-full flex h-screen bg-slate-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="absolute top-3 right-3 p-2 z-30 bg-white rounded-xl shadow-sm border border-slate-100 w-10 h-10 flex items-center justify-center text-slate-500 sm:hidden transition hover:bg-slate-50"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/20 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
