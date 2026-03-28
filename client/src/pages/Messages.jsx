import React from "react";
import { Eye, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Messages = () => {
  const { connections } = useSelector((state) => state.connections);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
          <p className="text-sm text-slate-400 mt-1">Talk to your friends and family</p>
        </div>

        {/* Connections List */}
        <div className="space-y-2">
          {connections?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No connections yet</p>
              <p className="text-slate-400 text-xs mt-1">Connect with people to start chatting</p>
            </div>
          )}

          {connections?.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <img
                src={user.profile_picture}
                alt=""
                className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-slate-50"
              />

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-slate-400 truncate">@{user.username}</p>
                {user.bio && (
                  <p className="text-xs text-slate-500 mt-1 truncate">{user.bio}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  title="Message"
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-700 active:scale-95 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  title="View Profile"
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 active:scale-95 transition cursor-pointer"
                >
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
