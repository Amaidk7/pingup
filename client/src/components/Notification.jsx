import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const Notification = ({ t, message }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div
      className={`max-w-sm w-full rounded-2xl overflow-hidden transition-all duration-300 border shadow-xl ${
        isDark
          ? "bg-zinc-900 border-white/10 hover:border-white/20"
          : "bg-white border-slate-100 hover:shadow-2xl"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="relative shrink-0">
          <img
            src={message?.from_user_id?.profile_picture}
            alt=""
            className={`h-10 w-10 rounded-full object-cover ring-2 ${isDark ? "ring-white/10" : "ring-slate-100"}`}
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 ${isDark ? "border-zinc-900" : "border-white"}`}
          ></span>
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {message?.from_user_id?.full_name}
          </p>
          <p
            className={`text-xs truncate mt-0.5 ${isDark ? "text-white/40" : "text-slate-400"}`}
          >
            {message?.text?.slice(0, 45)}
            {message?.text?.length > 45 ? "..." : ""}
          </p>
        </div>

        <button
          onClick={() => {
            navigate(`/messages/${message?.from_user_id?._id}`);
            toast.dismiss(t.id);
          }}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-black px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer"
        >
          Reply <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
