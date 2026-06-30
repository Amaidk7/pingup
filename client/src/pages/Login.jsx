import React from "react";
import { assets } from "../assets/assets";
import { Star } from "lucide-react";
import { SignIn } from "@clerk/clerk-react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row relative ${isDark ? "bg-black" : "bg-slate-50"}`}
    >
      <img
        src={assets.bgImage}
        alt=""
        className={`absolute top-0 left-0 -z-10 w-full h-full object-cover ${isDark ? "opacity-30" : "opacity-10"}`}
      />
      <div
        className={`absolute inset-0 -z-10 ${isDark ? "bg-gradient-to-br from-black via-black/90 to-sky-950/30" : "bg-gradient-to-br from-slate-50/90 via-white/80 to-sky-50/50"}`}
      />

      {/* Theme toggle top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left: Branding */}
      <div className="flex-1 flex flex-col items-start justify-between p-8 md:p-12 lg:pl-20 xl:pl-32">
        <img src={assets.logo} alt="" className="h-10 object-contain" />

        <div className="max-md:mt-12">
          <div className="flex items-center gap-3 mb-6">
            <img src={assets.group_users} alt="" className="h-9 md:h-11" />
            <div>
              <div className="flex gap-0.5">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 text-transparent fill-amber-400"
                    />
                  ))}
              </div>
              <p
                className={`text-sm mt-0.5 ${isDark ? "text-white/40" : "text-slate-500"}`}
              >
                Used by 12k+ people
              </p>
            </div>
          </div>

          <h1
            className={`text-4xl md:text-6xl font-bold leading-tight mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
          >
            More than just
            <br />
            <span className={isDark ? "text-white/30" : "text-slate-400"}>
              friends
            </span>{" "}
            — truly
            <br />
            connect.
          </h1>

          <p
            className={`text-lg md:text-xl max-w-sm leading-relaxed ${isDark ? "text-white/30" : "text-slate-500"}`}
          >
            Join the global community on PingUp.
          </p>
        </div>

        <span className="md:h-10"></span>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <SignIn />
        </div>
      </div>
    </div>
  );
};

export default Login;
