import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const StoriesBar = () => {
  const { getToken } = useAuth();
  const [stories, setStories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const { isDark } = useTheme();

  const fetchStories = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/story/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setStories(data.stories || []);
      else toast(data.message);
    } catch (error) { toast.error(error.message); }
  };

  useEffect(() => { fetchStories(); }, []);

  return (
    <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4">
      <div className="flex gap-3 pb-4">

        {/* Add Story */}
        <button onClick={() => setShowModal(true)}
          className={`group relative rounded-2xl min-w-[5.5rem] max-w-[5.5rem] h-36 cursor-pointer transition-all duration-200 border-2 border-dashed flex flex-col items-center justify-center gap-2 ${
            isDark
              ? "bg-zinc-900 border-white/10 hover:border-sky-500/40 hover:bg-zinc-800"
              : "bg-slate-50 border-slate-200 hover:border-slate-400 hover:bg-slate-100"
          }`}>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isDark ? "bg-sky-500 group-hover:bg-sky-400" : "bg-slate-900 group-hover:bg-slate-700"}`}>
            <Plus className={`w-4 h-4 ${isDark ? "text-black" : "text-white"}`} />
          </div>
          <p className={`text-[10px] font-medium text-center px-2 leading-tight ${isDark ? "text-white/40 group-hover:text-white/60" : "text-slate-500 group-hover:text-slate-700"}`}>
            Add Story
          </p>
        </button>

        {/* Story Cards */}
        {stories?.map((story, index) => (
          <div onClick={() => setViewStory(story)} key={index}
            className="relative rounded-2xl min-w-[5.5rem] max-w-[5.5rem] h-36 cursor-pointer overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

            {story.media_type === "text" ? (
              <div className="absolute inset-0" style={{ backgroundColor: story.background_color || "#0f172a" }} />
            ) : (
              <div className="absolute inset-0 bg-zinc-800">
                {story.media_type === "image" ? (
                  <img src={story.media_url} alt="" className="h-full w-full object-cover opacity-80" />
                ) : (
                  <video src={story.media_url} className="h-full w-full object-cover opacity-80" />
                )}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute top-2 left-2">
              <div className="w-7 h-7 rounded-full border-2 border-sky-400 overflow-hidden">
                <img src={story.user.profile_picture} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {story.media_type === "text" && story.content && (
              <p className="absolute inset-0 flex items-center justify-center text-white text-[10px] text-center px-2 leading-tight font-medium">
                {story.content.slice(0, 40)}
              </p>
            )}

            <p className="absolute bottom-1.5 left-2 text-white/50 text-[9px]">
              {moment(story.createdAt).fromNow()}
            </p>
          </div>
        ))}
      </div>

      {showModal && <StoryModal setShowModal={setShowModal} fetchStories={fetchStories} />}
      {viewStory && <StoryViewer viewStory={viewStory} setViewStory={setViewStory} />}
    </div>
  );
};

export default StoriesBar;
