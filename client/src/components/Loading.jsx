// ── Loading.jsx ──
import React from "react";
import { useTheme } from "../context/ThemeContext";

const Loading = ({ height = "100vh" }) => {
  const { isDark } = useTheme();
  return (
    <div style={{ height }} className={`flex items-center justify-center ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className={`absolute inset-0 rounded-full border-2 ${isDark ? "border-white/10" : "border-slate-200"}`}></div>
          <div className={`absolute inset-0 rounded-full border-2 border-t-transparent border-r-transparent border-b-transparent animate-spin ${isDark ? "border-l-sky-500" : "border-l-slate-800"}`}></div>
        </div>
        <span className={`text-xs tracking-[0.2em] uppercase font-light animate-pulse ${isDark ? "text-white/30" : "text-slate-400"}`}>Loading</span>
      </div>
    </div>
  );
};

export default Loading;
