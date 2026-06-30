import React from "react";
import {
  MapPin,
  MessageCircle,
  UserCheck,
  UserPlus,
  Clock,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";
import { fetchConnections } from "../features/connections/connectionSlice";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

const UserCard = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value);
  const { connections, pendingConnections, following } = useSelector(
    (state) => state.connections,
  );
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleFollow = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success(data.message);
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleConnectionRequest = async () => {
    if (currentUser?.connections?.includes(user._id)) {
      return navigate("/messages/" + user._id);
    }
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // check states
  const isFollowing = following?.some((f) => (f._id || f) === user._id);
  const isPending = pendingConnections?.some((p) => (p._id || p) === user._id);

  const followBtnStyle = isFollowing
    ? isDark
      ? "bg-white/5 text-white/20 cursor-not-allowed"
      : "bg-slate-100 text-slate-400 cursor-not-allowed"
    : isPending
      ? isDark
        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-not-allowed"
        : "bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed"
      : isDark
        ? "bg-sky-500 text-black hover:bg-sky-400 active:scale-95"
        : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95";

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 w-64 overflow-hidden ${
        isDark
          ? "bg-zinc-900 border-white/5 hover:border-white/10"
          : "bg-white border-slate-100 shadow-sm hover:shadow-md"
      }`}
    >
      <div
        className={`h-1 bg-gradient-to-r ${isDark ? "from-sky-500/40 via-sky-400/20 to-transparent" : "from-slate-300 via-slate-200 to-transparent"}`}
      />
      <div className="p-5">
        <div className="flex flex-col items-center text-center">
          <img
            src={
              user.profile_picture ||
              `https://ui-avatars.com/api/?name=${user.full_name}`
            }
            alt="profile"
            className={`w-16 h-16 rounded-full object-cover ring-4 ${isDark ? "ring-white/5" : "ring-slate-50"}`}
          />
          <h3
            className={`mt-3 font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {user.full_name}
          </h3>
          {user.username && (
            <p
              className={`text-xs mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`}
            >
              @{user.username}
            </p>
          )}
          {user.bio && (
            <p
              className={`text-xs mt-2 line-clamp-2 leading-relaxed px-2 ${isDark ? "text-white/40" : "text-slate-500"}`}
            >
              {user.bio}
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <span
            className={`inline-flex items-center gap-1 text-[10px] rounded-full px-2.5 py-1 ${isDark ? "text-white/30 bg-white/5 border border-white/5" : "text-slate-500 bg-slate-50 border border-slate-100"}`}
          >
            <MapPin className="w-3 h-3" />
            {user.location || "Somewhere"}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[10px] rounded-full px-2.5 py-1 ${isDark ? "text-white/30 bg-white/5 border border-white/5" : "text-slate-500 bg-slate-50 border border-slate-100"}`}
          >
            {user.followers?.length || 0} followers
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleFollow}
            disabled={isFollowing || isPending}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${followBtnStyle}`}
          >
            {isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5" /> Following
              </>
            ) : isPending ? (
              <>
                <Clock className="w-3.5 h-3.5" /> Requested
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Follow
              </>
            )}
          </button>

          <button
            onClick={handleConnectionRequest}
            className={`w-10 flex items-center justify-center border rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
              isDark
                ? "border-white/10 text-white/40 hover:text-white hover:border-white/30"
                : "border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
