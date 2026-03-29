import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { PenSquare, LogOut, Clapperboard } from "lucide-react";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();
  const { isDark } = useTheme();

  return (
    <div
      className={`w-60 xl:w-64 flex flex-col justify-between max-sm:absolute top-0 bottom-0 z-20 transition-all duration-300 ease-in-out ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } ${isDark
        ? "bg-zinc-950 border-r border-white/5"
        : "bg-white border-r border-slate-100"
      }`}
    >
      <div className="w-full">

        {/* Logo */}
        <div className="px-6 py-5">
          {assets?.logo && (
            <img
              onClick={() => navigate("/")}
              src={assets.logo}
              className="w-24 cursor-pointer"
              alt="logo"
            />
          )}
        </div>

        <div className="px-3 mb-4">
          <MenuItems setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Reels */}
        <div className="px-4 mb-2">
          <Link
            to="/reels"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
              isDark
                ? "text-white/50 hover:text-white hover:bg-white/5"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <Clapperboard className={`w-4 h-4 ${isDark ? "text-white/30" : "text-slate-400"}`} />
            <span className="tracking-wide">Reels</span>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="px-4 space-y-2">
          <Link
            to="/create-post"
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-all duration-200 cursor-pointer ${
              isDark
                ? "bg-sky-500 hover:bg-sky-400 text-black"
                : "bg-slate-900 hover:bg-slate-700 text-white"
            }`}
          >
            <PenSquare className="w-4 h-4" />
            New Post
          </Link>

          <Link
            to="/create-reel"
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium active:scale-95 transition-all duration-200 cursor-pointer border ${
              isDark
                ? "border-white/10 hover:border-white/20 hover:bg-white/5 text-white/70"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            New Reel
          </Link>
        </div>

      </div>

      {/* User + Theme Toggle */}
      <div className={`border-t p-4 mx-2 mb-2 ${isDark ? "border-white/5" : "border-slate-100"}`}>
        <div className={`flex items-center justify-between rounded-xl p-2 transition-all duration-200 cursor-pointer group ${
          isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
        }`}>
          <div className="flex gap-3 items-center">
            <UserButton />
            <div>
              <h1 className={`text-sm font-semibold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {user?.full_name || "User"}
              </h1>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>
                @{user?.username || "username"}
              </p>
            </div>
          </div>

          <LogOut
            onClick={signOut}
            className={`w-4 h-4 transition cursor-pointer ${
              isDark ? "text-white/20 group-hover:text-white/50" : "text-slate-300 group-hover:text-slate-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
