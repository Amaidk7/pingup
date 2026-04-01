import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { Sparkles } from "lucide-react";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) setFeeds(data.posts);
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
    setLoading(false);
  };

  const handlePostDelete = (postId) => setFeeds((prev) => prev.filter((p) => p._id !== postId));

  useEffect(() => { fetchFeeds(); }, []);

  return !loading ? (
    <div className={`h-full overflow-y-scroll no-scrollbar flex items-start justify-center xl:gap-8 py-6 xl:pr-4 bg-transparent`}>

      <div className="w-full max-w-2xl">
        <div className="mb-2"><StoriesBar /></div>
        <div className="px-4 space-y-4">
          {feeds?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                <span className="text-2xl">✦</span>
              </div>
              <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-slate-500"}`}>No posts yet</p>
              <p className={`text-xs mt-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>Follow people to see their posts here</p>
            </div>
          ) : (
            feeds?.map((post) => <PostCard key={post._id} post={post} onDelete={handlePostDelete} />)
          )}
        </div>
      </div>

      {/* ✅ Right Sidebar — improved */}
      <div className="max-xl:hidden sticky top-0 pt-2 min-w-[16rem] space-y-3">

        {/* Sponsored — compact & glassy */}
        <div className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${
          isDark
            ? "bg-white/3 border-white/8"
            : "bg-white/70 border-slate-200/80 shadow-sm"
        }`}>
          {/* Label */}
          <div className={`flex items-center gap-1.5 px-3 pt-3 pb-1.5 ${isDark ? "" : ""}`}>
            <Sparkles className={`w-3 h-3 ${isDark ? "text-sky-400" : "text-indigo-400"}`} />
            <p className={`text-[9px] font-bold tracking-widest uppercase ${isDark ? "text-white/25" : "text-slate-400"}`}>
              Sponsored
            </p>
          </div>

          {/* Image — smaller */}
          <div className="px-3 pb-1">
            <img
              src={assets.sponsored_img}
              className="w-full rounded-xl object-cover"
              style={{ aspectRatio: "16/7" }}
              alt=""
            />
          </div>

          {/* Text */}
          <div className="px-3 pb-3">
            <p className={`text-xs font-semibold mt-1.5 ${isDark ? "text-white/80" : "text-slate-800"}`}>
              Email Marketing
            </p>
            <p className={`text-[10px] mt-0.5 leading-relaxed ${isDark ? "text-white/25" : "text-slate-400"}`}>
              Supercharge your marketing with powerful tools.
            </p>
            <button className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-semibold transition ${
              isDark
                ? "bg-sky-500/20 text-sky-400 hover:bg-sky-500/30"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}>
              Learn More →
            </button>
          </div>
        </div>

        {/* Recent Messages */}
        <RecentMessages />
      </div>

    </div>
  ) : <Loading />;
};

export default Feed;
