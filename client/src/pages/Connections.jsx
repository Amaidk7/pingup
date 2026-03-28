import React, { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserRoundPen,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchConnections } from "../features/connections/connectionSlice";
import api from "../api/axios";
import toast from "react-hot-toast";

const Connections = () => {
  const [currentTab, setCurrentTab] = useState("Followers");

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const dispatch = useDispatch();

  const { connections, pendingConnections, followers, following } =
    useSelector((state) => state.connections);

  const dataArray = [
    { label: "Followers", value: followers, icon: Users },
    { label: "Following", value: following, icon: UserCheck },
    { label: "Pending", value: pendingConnections, icon: UserRoundPen },
    { label: "Connections", value: connections, icon: UserPlus },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        dispatch(fetchConnections(await getToken()));
      } else {
        toast(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token));
    });
  }, [dispatch, getToken]);

  const currentData =
    dataArray.find((item) => item.label === currentTab)?.value || [];

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Connections</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your network and discover new connections</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {dataArray.map((item, index) => (
            <button
              key={index}
              onClick={() => setCurrentTab(item.label)}
              className={`flex flex-col items-center justify-center gap-1 py-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                currentTab === item.label
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-sm"
              }`}
            >
              <item.icon className={`w-4 h-4 mb-1 ${currentTab === item.label ? "text-white/70" : "text-slate-300"}`} />
              <span className="text-xl font-bold">{item.value?.length || 0}</span>
              <span className={`text-xs ${currentTab === item.label ? "text-white/60" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl p-1 shadow-sm mb-6 w-fit">
          {dataArray.map((tab) => (
            <button
              onClick={() => setCurrentTab(tab.label)}
              key={tab.label}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                currentTab === tab.label
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                currentTab === tab.label ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {tab.value?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2">
          {currentData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No {currentTab.toLowerCase()} yet</p>
            </div>
          )}

          {currentData.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200"
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
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {user.bio?.slice(0, 50)}{user.bio?.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className="px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-700 rounded-xl active:scale-95 transition cursor-pointer"
                >
                  Profile
                </button>

                {currentTab === "Following" && (
                  <button
                    onClick={() => handleUnfollow(user._id)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-400 rounded-xl active:scale-95 transition cursor-pointer"
                  >
                    Unfollow
                  </button>
                )}

                {currentTab === "Pending" && (
                  <button
                    onClick={() => acceptConnection(user._id)}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 hover:border-slate-400 rounded-xl active:scale-95 transition cursor-pointer"
                  >
                    Accept
                  </button>
                )}

                {currentTab === "Connections" && (
                  <button
                    onClick={() => navigate(`/messages/${user._id}`)}
                    className="w-9 h-9 flex items-center justify-center border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 rounded-xl active:scale-95 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
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
