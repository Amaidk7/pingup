import React from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Notification = ({ t, message }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-sm w-full bg-white border border-slate-100 shadow-xl shadow-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center gap-3 p-4">
        <div className="relative shrink-0">
          <img
            src={message?.from_user_id?.profile_picture}
            alt=""
            className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {message?.from_user_id?.full_name}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {message?.text?.slice(0, 45)}
            {message?.text?.length > 45 ? "..." : ""}
          </p>
        </div>

        <button
          onClick={() => {
            navigate(`/messages/${message?.from_user_id?._id}`);
            toast.dismiss(t.id);
          }}
          className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-900 bg-slate-50 hover:bg-slate-900 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer"
        >
          Reply <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
