// ── RecentMessages.jsx ──
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { MessageSquare } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        const grouped = data.messages.reduce((acc, msg) => {
          const sid = msg.from_user_id._id;
          if (
            !acc[sid] ||
            new Date(msg.createdAt) > new Date(acc[sid].createdAt)
          )
            acc[sid] = msg;
          return acc;
        }, {});
        setMessages(
          Object.values(grouped).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
          ),
        );
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();
      const i = setInterval(fetchRecentMessages, 3000);
      return () => clearInterval(i);
    }
  }, [user]);

  return (
    <div
      className={`rounded-2xl border p-4 mt-4 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare
          className={`w-4 h-4 ${isDark ? "text-white/30" : "text-slate-400"}`}
        />
        <h3
          className={`text-sm font-semibold tracking-wide ${isDark ? "text-white/80" : "text-slate-800"}`}
        >
          Messages
        </h3>
      </div>
      <div className="flex flex-col max-h-64 overflow-y-auto no-scrollbar space-y-0.5">
        {messages.length === 0 ? (
          <p
            className={`text-xs text-center py-4 ${isDark ? "text-white/20" : "text-slate-400"}`}
          >
            No messages yet
          </p>
        ) : (
          messages.map((message, index) => (
            <Link
              to={`/messages/${message.from_user_id._id}`}
              key={index}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 ${isDark ? "hover:bg-white/5" : "hover:bg-slate-50"}`}
            >
              <div className="relative shrink-0">
                <img
                  src={message.from_user_id.profile_picture}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                {!message.seen && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-sky-400 rounded-full border-2 ${isDark ? "border-zinc-900" : "border-white"}`}
                  ></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p
                    className={`text-xs font-semibold truncate ${isDark ? "text-white/80" : "text-slate-900"}`}
                  >
                    {message.from_user_id.full_name}
                  </p>
                  <p
                    className={`text-[10px] shrink-0 ml-2 ${isDark ? "text-white/25" : "text-slate-400"}`}
                  >
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>
                <p
                  className={`text-xs truncate mt-0.5 ${!message.seen ? "text-sky-400 font-medium" : isDark ? "text-white/30" : "text-slate-500"}`}
                >
                  {message.text ? message.text : "📎 Media"}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentMessages;
