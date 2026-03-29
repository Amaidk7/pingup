import { Calendar, MapPin, PenLine, Verified } from "lucide-react";
import React from "react";
import moment from "moment";
import { useTheme } from "../context/ThemeContext";

const UserProfileInfo = ({ user, posts, profileId, setShowEdit }) => {
  const { isDark } = useTheme();
  const profileImage = user?.profile_picture && user.profile_picture !== ""
    ? user.profile_picture
    : `https://ui-avatars.com/api/?name=${user?.full_name}`;

  return (
    <div className={`relative py-5 px-6 md:px-8 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className={`w-28 h-28 border-4 shadow-md absolute -top-14 rounded-full overflow-hidden ring-2 ${isDark ? "border-zinc-900 ring-white/10" : "border-white ring-slate-100"}`}>
          <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
        </div>

        <div className="w-full pt-16 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{user?.full_name}</h1>
                <Verified className="w-5 h-5 text-sky-400" />
              </div>
              <p className={`text-sm mt-0.5 ${isDark ? "text-white/30" : "text-slate-400"}`}>
                {user?.username ? `@${user.username}` : "Add a username"}
              </p>
            </div>
            {!profileId && (
              <button onClick={() => setShowEdit(true)}
                className={`flex items-center gap-2 border px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isDark ? "border-white/10 hover:border-white/20 hover:bg-white/5 text-white/60" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-600"
                }`}>
                <PenLine className="w-3.5 h-3.5" /> Edit Profile
              </button>
            )}
          </div>

          {user?.bio && <p className={`text-sm max-w-md mt-3 leading-relaxed ${isDark ? "text-white/50" : "text-slate-600"}`}>{user.bio}</p>}

          <div className={`flex flex-wrap items-center gap-4 text-xs mt-3 ${isDark ? "text-white/25" : "text-slate-400"}`}>
            {(user?.location || !profileId) && (
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{user?.location || "Add location"}</span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined <span className={`font-medium ml-1 ${isDark ? "text-white/40" : "text-slate-500"}`}>{user?.createdAt ? moment(user.createdAt).fromNow() : ""}</span>
            </span>
          </div>

          <div className={`flex items-center gap-6 mt-5 pt-4 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
            {[
              { label: "Posts", value: posts?.length || 0 },
              { label: "Followers", value: user?.followers?.length || 0 },
              { label: "Following", value: user?.following?.length || 0 },
            ].map(({ label, value }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <div className={`w-px h-8 ${isDark ? "bg-white/5" : "bg-slate-100"}`} />}
                <div className="text-center">
                  <span className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{value}</span>
                  <p className={`text-xs mt-0.5 ${isDark ? "text-white/25" : "text-slate-400"}`}>{label}</p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileInfo;
