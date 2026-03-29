import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { PenSquare, LogOut, Clapperboard } from "lucide-react";
import { UserButton, useClerk } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.value);
  const { signOut } = useClerk();

  return (
    <div
      className={`w-60 xl:w-64 bg-white border-r border-slate-100 flex flex-col justify-between max-sm:absolute top-0 bottom-0 z-20 ${
        sidebarOpen ? "translate-x-0" : "max-sm:-translate-x-full"
      } transition-all duration-300 ease-in-out`}
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

        {/* Reels Button */}
        <div className="px-4 mb-2">
          <Link
            to="/reels"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200"
          >
            <Clapperboard className="w-4 h-4 text-slate-400" />
            <span className="tracking-wide">Reels</span>
          </Link>
        </div>

        {/* Create Post */}
        <div className="px-4 space-y-2">
          <Link
            to="/create-post"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 active:scale-95 transition-all duration-200 text-white text-sm font-medium cursor-pointer"
          >
            <PenSquare className="w-4 h-4" />
            New Post
          </Link>

          {/* Create Reel */}
          <Link
            to="/create-reel"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 active:scale-95 transition-all duration-200 text-slate-700 text-sm font-medium cursor-pointer"
          >
            <Clapperboard className="w-4 h-4" />
            New Reel
          </Link>
        </div>

      </div>

      {/* User section */}
      <div className="border-t border-slate-100 p-4 mx-2 mb-2">
        <div className="flex items-center justify-between rounded-xl p-2 hover:bg-slate-50 transition-all duration-200 cursor-pointer group">

          <div className="flex gap-3 items-center">
            <UserButton />
            <div>
              <h1 className="text-sm font-semibold text-slate-900 leading-tight">
                {user?.full_name || "User"}
              </h1>
              <p className="text-xs text-slate-400">
                @{user?.username || "username"}
              </p>
            </div>
          </div>

          <LogOut
            onClick={signOut}
            className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition cursor-pointer"
          />

        </div>
      </div>
    </div>
  );
};

export default Sidebar;
