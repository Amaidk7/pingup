import React, { useEffect, useState } from "react";
import { Users, UserPlus, UserCheck, UserRoundPen, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionSlice";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { isDark } = useTheme();
  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections);

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post("/api/user/unfollow", { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) { toast.success(data.message); dispatch(fetchConnections(await getToken())); }
      else toast(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post("/api/user/accept", { id: userId },
        { headers: { Authorization: `Bearer ${await getToken()}` } });
      if (data.success) { toast.success(data.message); dispatch(fetchConnections(await getToken())); }
      else toast(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => {
    getToken().then((token) => { dispatch(fetchConnections(token)); });
  }, [dispatch, getToken]);

  const currentData = dataArray.find((item) => item.label === currentTab)?.value || [];

  const activeBtn = isDark ? "bg-sky-500 border-sky-500 text-black shadow-lg" : "bg-slate-900 border-slate-900 text-white shadow-lg";
  const inactiveBtn = isDark ? "bg-zinc-900 border-white/5 text-white hover:border-white/10" : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm";

  return (
    <div className={`min-h-screen overflow-y-auto no-scrollbar ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Connections</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Manage your network</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {dataArray.map((item) => (
            <button key={item.label} onClick={() => setCurrentTab(item.label)}
              className={`flex flex-col items-center justify-center gap-1 py-5 rounded-2xl border transition-all duration-200 cursor-pointer ${currentTab === item.label ? activeBtn : inactiveBtn}`}>
              <item.icon className={`w-4 h-4 mb-1 ${currentTab === item.label ? (isDark ? "text-black/60" : "text-white/60") : isDark ? "text-white/20" : "text-slate-300"}`} />
              <span className="text-xl font-bold">{item.value?.length || 0}</span>
              <span className={`text-xs ${currentTab === item.label ? (isDark ? "text-black/60" : "text-white/60") : isDark ? "text-white/30" : "text-slate-400"}`}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 rounded-2xl p-1 mb-6 w-fit border ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          {dataArray.map((tab) => (
            <button key={tab.label} onClick={() => setCurrentTab(tab.label)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                currentTab === tab.label
                  ? isDark ? "bg-sky-500 text-black" : "bg-slate-900 text-white"
                  : isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-800"
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                currentTab === tab.label
                  ? "bg-black/20 text-current"
                  : isDark ? "bg-white/5 text-white/30" : "bg-slate-100 text-slate-500"
              }`}>{tab.value?.length || 0}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {currentData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                <Users className={`w-5 h-5 ${isDark ? "text-white/20" : "text-slate-300"}`} />
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-white/30" : "text-slate-500"}`}>No {currentTab.toLowerCase()} yet</p>
            </div>
          )}

          {currentData.map((user) => (
            <div key={user._id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                isDark ? "bg-zinc-900 border-white/5 hover:border-white/10" : "bg-white border-slate-100 shadow-sm hover:shadow-md"
              }`}>
              <img src={user.profile_picture} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.full_name}</p>
                <p className={`text-xs truncate ${isDark ? "text-white/30" : "text-slate-400"}`}>@{user.username}</p>
                {user.bio && <p className={`text-xs mt-0.5 truncate ${isDark ? "text-white/20" : "text-slate-500"}`}>{user.bio?.slice(0, 50)}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => navigate(`/profile/${user._id}`)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl active:scale-95 transition cursor-pointer ${
                    isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}>Profile</button>
                {currentTab === "Following" && (
                  <button onClick={() => handleUnfollow(user._id)}
                    className={`px-3 py-2 text-xs font-semibold border rounded-xl active:scale-95 transition cursor-pointer ${
                      isDark ? "text-white/50 border-white/10 hover:border-white/20" : "text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}>Unfollow</button>
                )}
                {currentTab === "Pending" && (
                  <button onClick={() => acceptConnection(user._id)}
                    className={`px-3 py-2 text-xs font-semibold border rounded-xl active:scale-95 transition cursor-pointer ${
                      isDark ? "text-white/50 border-white/10 hover:border-white/20" : "text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}>Accept</button>
                )}
                {currentTab === "Connections" && (
                  <button onClick={() => navigate(`/messages/${user._id}`)}
                    className={`w-9 h-9 flex items-center justify-center border rounded-xl active:scale-95 transition cursor-pointer ${
                      isDark ? "border-white/10 text-white/40 hover:border-white/20 hover:text-white" : "border-slate-200 text-slate-500 hover:border-slate-400"
                    }`}><MessageSquare className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Connections;
