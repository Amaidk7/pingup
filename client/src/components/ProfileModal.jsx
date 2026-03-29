import React, { useState } from "react";
import { Camera, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../features/user/userSlice";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const ProfileModal = ({ setShowEdit }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);
  const { isDark } = useTheme();

  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: null,
    cover_photo: null,
    full_name: user?.full_name || "",
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const userData = new FormData();
      const { full_name, username, bio, location, profile_picture, cover_photo } = editForm;
      userData.append("username", username);
      userData.append("bio", bio);
      userData.append("location", location);
      userData.append("full_name", full_name);
      if (profile_picture) userData.append("profile", profile_picture);
      if (cover_photo) userData.append("cover", cover_photo);
      const token = await getToken();
      await dispatch(updateUser({ userData, token }));
      setShowEdit(false);
    } catch (error) { toast.error(error.message); }
  };

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition border ${
    isDark
      ? "bg-zinc-800 border-white/10 text-white placeholder-white/20 focus:border-sky-500/50"
      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-300 focus:border-slate-400"
  }`;

  const labelClass = `block text-xs font-medium mb-1.5 tracking-wide uppercase ${isDark ? "text-white/40" : "text-slate-500"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden ${isDark ? "bg-zinc-900 border-white/10" : "bg-white border-slate-100"}`}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/5" : "border-slate-100"}`}>
          <h1 className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>Edit Profile</h1>
          <button onClick={() => setShowEdit(false)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition cursor-pointer ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
            <X className={`w-4 h-4 ${isDark ? "text-white/50" : "text-slate-500"}`} />
          </button>
        </div>

        <form className="p-6 space-y-5"
          onSubmit={(e) => toast.promise(handleSaveProfile(e), { loading: "Saving..." })}>

          {/* Cover Photo */}
          <div className="relative">
            <label htmlFor="cover_photo" className="cursor-pointer block">
              <div className={`w-full h-32 rounded-xl overflow-hidden relative group ${isDark ? "bg-zinc-800" : "bg-slate-200"}`}>
                <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user?.cover_photo}
                  alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all duration-200">
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 bg-black/70 rounded-lg px-3 py-1.5 text-xs font-medium text-white">
                    <Camera className="w-3.5 h-3.5" /> Change Cover
                  </div>
                </div>
              </div>
              <input hidden type="file" accept="image/*" id="cover_photo"
                onChange={(e) => setEditForm({ ...editForm, cover_photo: e.target.files[0] })} />
            </label>

            <label htmlFor="profile_picture" className="absolute -bottom-8 left-5 cursor-pointer">
              <div className="relative group">
                <img src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user?.profile_picture}
                  alt="" className={`w-16 h-16 rounded-full object-cover border-4 ${isDark ? "border-zinc-900" : "border-white"}`} />
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition-all duration-200">
                  <Camera className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
              <input hidden type="file" accept="image/*" id="profile_picture"
                onChange={(e) => setEditForm({ ...editForm, profile_picture: e.target.files[0] })} />
            </label>
          </div>

          <div className="pt-8 space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" className={inputClass} placeholder="Your full name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Username</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-white/30" : "text-slate-400"}`}>@</span>
                <input type="text" className={`${inputClass} pl-8`} placeholder="username"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Tell people about yourself..."
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input type="text" className={inputClass} placeholder="Where are you based?"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowEdit(false)} type="button"
              className={`px-5 py-2.5 border rounded-xl text-sm transition cursor-pointer ${isDark ? "border-white/10 text-white/60 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              Cancel
            </button>
            <button type="submit"
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl active:scale-95 transition cursor-pointer ${isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
