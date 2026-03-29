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
    <div className={`h-full overflow-y-scroll no-scrollbar flex items-start justify-center xl:gap-8 py-6 xl:pr-4 ${isDark ? "bg-black" : "bg-slate-50"}`}>

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

      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-0 pt-2 min-w-[17rem]">
        <div className={`rounded-2xl border p-4 ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className={`text-[10px] font-semibold tracking-widest uppercase mb-3 ${isDark ? "text-white/20" : "text-slate-400"}`}>Sponsored</p>
          <img src={assets.sponsored_img} className="w-full rounded-xl object-cover aspect-video" alt="" />
          <p className={`text-sm font-semibold mt-3 ${isDark ? "text-white" : "text-slate-800"}`}>Email Marketing</p>
          <p className={`text-xs mt-1 leading-relaxed ${isDark ? "text-white/30" : "text-slate-400"}`}>
            Supercharge your marketing with a powerful, easy-to-use platform built for results.
          </p>
        </div>
        <RecentMessages />
      </div>

    </div>
  ) : <Loading />;
};

export default Feed;
