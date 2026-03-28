import { Calendar, MapPin, PenLine, Verified } from "lucide-react";
import React from "react";
import moment from "moment";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {

  const profileImage =
    user?.profile_picture && user.profile_picture !== ""
      ? user.profile_picture
      : `https://ui-avatars.com/api/?name=${user?.full_name}&background=f1f5f9&color=475569`;

  return (
    <div className="relative py-5 px-6 md:px-8 bg-white">

      <div className="flex flex-col md:flex-row items-start gap-6">

        {/* Avatar */}
        <div className="w-28 h-28 border-4 border-white shadow-md absolute -top-14 rounded-full overflow-hidden ring-1 ring-slate-100">
          <img
            src={profileImage}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full pt-16 md:pt-0 md:pl-36">

          {/* Name + Edit */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-3">

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {user?.full_name}
                </h1>
                <Verified className="w-5 h-5 text-sky-500" />
              </div>

              <p className="text-sm text-slate-400 mt-0.5">
                {user?.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>

            {!profileId && (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-2 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 transition-all duration-200 cursor-pointer"
              >
                <PenLine className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}

          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-sm text-slate-600 max-w-md mt-3 leading-relaxed">
              {user.bio}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">

            {(user?.location || !profileId) && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {user?.location || "Add location"}
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined{" "}
              <span className="font-medium text-slate-500">
                {user?.createdAt ? moment(user.createdAt).fromNow() : ""}
              </span>
            </span>

          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-5 pt-4 border-t border-slate-50">

            <div className="text-center">
              <span className="text-lg font-bold text-slate-900">
                {posts?.length || 0}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Posts</p>
            </div>

            <div className="w-px h-8 bg-slate-100"></div>

            <div className="text-center">
              <span className="text-lg font-bold text-slate-900">
                {user?.followers?.length || 0}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Followers</p>
            </div>

            <div className="w-px h-8 bg-slate-100"></div>

            <div className="text-center">
              <span className="text-lg font-bold text-slate-900">
                {user?.following?.length || 0}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">Following</p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default UserProfileInfo;
