import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to Light" : "Switch to Dark"}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
        isDark
          ? "bg-white/10 hover:bg-white/20 text-white/60 hover:text-white"
          : "bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800"
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
