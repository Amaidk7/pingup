import React, { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import RecentMessages from "../components/RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const Feed = () => {

  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const { getToken } = useAuth();

  const fetchFeeds = async () => {

    try {

      setLoading(true);

      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {

        setFeeds(data.posts);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }

    setLoading(false);
  };

  // post delete hone par list se remove karo
  const handlePostDelete = (postId) => {
    setFeeds((prev) => prev.filter((post) => post._id !== postId));
  };

  useEffect(() => {

    fetchFeeds();

  }, []);

  return !loading ? (

    <div className="h-full overflow-y-scroll no-scrollbar flex items-start justify-center xl:gap-8 py-6 xl:pr-4">

      {/* Main Feed */}
      <div className="w-full max-w-2xl">

        {/* Stories */}
        <div className="mb-2">
          <StoriesBar />
        </div>

        {/* Posts */}
        <div className="px-4 space-y-4">
          {feeds?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-2xl">✦</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">No posts yet</p>
              <p className="text-slate-400 text-xs mt-1">Follow people to see their posts here</p>
            </div>
          ) : (
            feeds?.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handlePostDelete} />
            ))
          )}
        </div>

      </div>

      {/* Right Sidebar */}
      <div className="max-xl:hidden sticky top-0 pt-2 min-w-[17rem]">

        {/* Sponsored */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase mb-3">
            Sponsored
          </p>
          <img
            src={assets.sponsored_img}
            className="w-full rounded-xl object-cover aspect-video"
            alt=""
          />
          <p className="text-sm font-semibold text-slate-800 mt-3">Email Marketing</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Supercharge your marketing with a powerful, easy-to-use platform built for results.
          </p>
        </div>

        <RecentMessages />

      </div>

    </div>

  ) : (

    <Loading />

  );
};

export default Feed;
