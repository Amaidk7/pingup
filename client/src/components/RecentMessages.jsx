import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { MessageSquare } from "lucide-react";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { user } = useUser();
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      const token = await getToken();

      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        const groupedMessages = data.messages.reduce((acc, message) => {
          const senderId = message.from_user_id._id;

          if (
            !acc[senderId] ||
            new Date(message.createdAt) > new Date(acc[senderId].createdAt)
          ) {
            acc[senderId] = message;
          }

          return acc;
        }, {});

        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentMessages();

      const interval = setInterval(fetchRecentMessages, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-4 h-4 text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-800 tracking-wide">Messages</h3>
      </div>

      <div className="flex flex-col max-h-64 overflow-y-auto no-scrollbar space-y-0.5">
        {messages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No messages yet</p>
        ) : (
          messages.map((message, index) => (
            <Link
              to={`/messages/${message.from_user_id._id}`}
              key={index}
              className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
            >
              <div className="relative shrink-0">
                <img
                  src={message.from_user_id.profile_picture}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
                {!message.seen && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-slate-900 rounded-full border-2 border-white"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {message.from_user_id.full_name}
                  </p>
                  <p className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>

                <p className={`text-xs truncate mt-0.5 ${!message.seen ? "text-slate-700 font-medium" : "text-slate-400"}`}>
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
