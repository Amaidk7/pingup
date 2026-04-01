import React from "react";
import { Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../context/ThemeContext";

const Messages = () => {
  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen overflow-y-auto no-scrollbar bg-transparent`}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Messages</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Talk to your friends and family</p>
        </div>

        <div className="space-y-2">
          {connections?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                <MessageSquare className={`w-6 h-6 ${isDark ? "text-white/20" : "text-slate-300"}`} />
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-white/30" : "text-slate-500"}`}>No connections yet</p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/15" : "text-slate-400"}`}>Connect with people to start chatting</p>
            </div>
          )}

          {connections?.map((user) => (
            <div key={user._id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                isDark ? "bg-zinc-900 border-white/5 hover:border-white/10" : "bg-white border-slate-100 hover:shadow-md shadow-sm"
              }`}>
              <img src={user.profile_picture} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.full_name}</p>
                <p className={`text-xs truncate ${isDark ? "text-white/30" : "text-slate-400"}`}>@{user.username}</p>
                {user.bio && <p className={`text-xs mt-1 truncate ${isDark ? "text-white/20" : "text-slate-500"}`}>{user.bio}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => navigate(`/messages/${user._id}`)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl active:scale-95 transition cursor-pointer ${
                    isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}>
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button onClick={() => navigate(`/profile/${user._id}`)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl border active:scale-95 transition cursor-pointer ${
                    isDark ? "border-white/10 text-white/40 hover:border-white/20 hover:text-white" : "border-slate-200 text-slate-500 hover:border-slate-400"
                  }`}>
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
