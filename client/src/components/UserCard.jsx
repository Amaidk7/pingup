import React from "react";
import { MapPin, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUser } from "../features/user/userSlice";
import api from "../api/axios";

const UserCard = ({ user }) => {

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleFollow = async () => {
    try {

      const { data } = await api.post(
        "/api/user/follow",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {

        toast.success(data.message);
        dispatch(fetchUser(await getToken()));

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

      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {

        toast.success(data.message);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }
  };

  const isFollowing = currentUser?.following?.includes(user._id);
  const isConnected = currentUser?.connections?.includes(user._id);

  return (

    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 w-64 overflow-hidden">

      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>

      <div className="p-5">

        {/* Avatar + Name */}
        <div className="flex flex-col items-center text-center">

          <img
            src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.full_name}&background=f1f5f9&color=475569`}
            alt="profile"
            className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-50 shadow-sm"
          />

          <h3 className="mt-3 font-semibold text-slate-900 text-sm">{user.full_name}</h3>

          {user.username && (
            <p className="text-xs text-slate-400 mt-0.5">@{user.username}</p>
          )}

          {user.bio && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed px-2">
              {user.bio}
            </p>
          )}

        </div>

        {/* Meta tags */}
        <div className="flex items-center justify-center gap-2 mt-4">

          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
            <MapPin className="w-3 h-3" />
            {user.location || "Somewhere"}
          </span>

          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
            {user.followers?.length || 0} followers
          </span>

        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">

          <button
            onClick={handleFollow}
            disabled={isFollowing}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isFollowing
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95"
            }`}
          >
            {isFollowing ? (
              <><UserCheck className="w-3.5 h-3.5" /> Following</>
            ) : (
              <><UserPlus className="w-3.5 h-3.5" /> Follow</>
            )}
          </button>

          <button
            onClick={handleConnectionRequest}
            title={isConnected ? "Message" : "Connect"}
            className="w-10 flex items-center justify-center border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-400 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

        </div>

      </div>

    </div>
  );
};

export default UserCard;
