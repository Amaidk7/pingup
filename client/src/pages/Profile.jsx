import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import UserProfileInfo from "../components/UserProfileInfo";
import moment from "moment";
import ProfileModal from "../components/ProfileModal";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();
  const { isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async (profileId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/user/profiles`, { profileId },
        { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { setUser(data.profile); setPosts(data.posts); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handlePostDelete = (postId) => setPosts((prev) => prev.filter((p) => p._id !== postId));

  useEffect(() => {
    if (!currentUser) return;
    if (profileId) fetchUser(profileId);
    else fetchUser(currentUser._id);
  }, [profileId, currentUser]);

  const tabs = ["posts", "media", "likes"];

  return user ? (
    <div className={`relative h-full overflow-y-scroll no-scrollbar ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <div className="max-w-2xl mx-auto pb-10 px-4 sm:px-6">

        {/* Profile Card */}
        <div className={`rounded-2xl border overflow-hidden mt-4 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className={`h-36 md:h-48 ${isDark ? "bg-zinc-800" : "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100"}`}>
            {user.cover_photo && (
              <img src={user.cover_photo} alt="" className={`w-full h-full object-cover ${isDark ? "opacity-80" : ""}`} />
            )}
          </div>
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className={`flex items-center gap-1 rounded-2xl p-1 border ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer capitalize ${
                  activeTab === tab
                    ? isDark ? "bg-sky-500 text-black" : "bg-slate-900 text-white"
                    : isDark ? "text-white/30 hover:text-white" : "text-slate-500 hover:text-slate-800"
                }`}>{tab}</button>
            ))}
          </div>

          {activeTab === "posts" && (
            <div className="mt-5 space-y-4">
              {posts?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className={`text-sm ${isDark ? "text-white/20" : "text-slate-400"}`}>No posts yet</p>
                </div>
              ) : (
                posts?.map((post) => <PostCard key={post._id} post={post} onDelete={handlePostDelete} />)
              )}
            </div>
          )}

          {activeTab === "media" && (
            <div className="mt-5 grid grid-cols-3 gap-1.5">
              {posts?.filter((post) => post.image_urls?.length > 0)
                .flatMap((post) =>
                  post.image_urls.map((image, index) => (
                    <Link target="_blank" to={image} key={`${post._id}-${index}`}
                      className="relative group aspect-square overflow-hidden rounded-xl">
                      <img src={image}
                        className={`w-full h-full object-cover group-hover:scale-105 transition duration-300 ${isDark ? "opacity-80 group-hover:opacity-100" : ""}`}
                        alt="" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-end">
                        <p className="w-full text-[10px] px-2 pb-2 text-white opacity-0 group-hover:opacity-100 transition">
                          {moment(post.createdAt).fromNow()}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              {posts?.filter((post) => post.image_urls?.length > 0).length === 0 && (
                <div className="col-span-3 py-16 text-center">
                  <p className={`text-sm ${isDark ? "text-white/20" : "text-slate-400"}`}>No media yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEdit && <ProfileModal setShowEdit={setShowEdit} />}
    </div>
  ) : <Loading />;
};

export default Profile;
