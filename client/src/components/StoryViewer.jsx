import React, { useEffect, useState } from "react";
import { BadgeCheck, X, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import toast from "react-hot-toast";

// StoryViewer is always fullscreen dark — no theme toggle needed
const StoryViewer = ({ viewStory, setViewStory, onDelete }) => {
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);

  const isOwner = currentUser?._id === viewStory?.user?._id;

  useEffect(() => {
    let timer, progressInterval;
    if (viewStory && viewStory.media_type !== "video") {
      setProgress(0);
      const duration = 10000;
      const setTime = 100;
      let elapsed = 0;
      progressInterval = setInterval(() => { elapsed += setTime; setProgress((elapsed / duration) * 100); }, setTime);
      timer = setTimeout(() => { setViewStory(null); }, duration);
    }
    return () => { clearTimeout(timer); clearInterval(progressInterval); };
  }, [viewStory, setViewStory]);

  if (!viewStory) return null;

  const handleDelete = async () => {
    if (!window.confirm("Delete this story?")) return;
    try {
      setDeleting(true);
      const token = await getToken();
      const { data } = await api.delete(`/api/story/delete/${viewStory._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success("Story deleted");
        setViewStory(null);
        if (onDelete) onDelete(viewStory._id); // ✅ StoriesBar se bhi remove karo
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    switch (viewStory.media_type) {
      case "image": return <img src={viewStory.media_url} alt="" className="max-w-full max-h-screen object-contain rounded-xl" />;
      case "video": return <video onEnded={() => setViewStory(null)} src={viewStory.media_url} className="max-h-screen rounded-xl" controls autoPlay />;
      case "text": return <div className="w-full h-full flex items-center justify-center p-10 text-white text-2xl text-center font-light leading-relaxed">{viewStory.content}</div>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 h-screen z-50 flex items-center justify-center"
      style={{ backgroundColor: viewStory.media_type === "text" ? viewStory.background_color : "#000000" }}>

      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/10">
        <div className="h-full bg-sky-400 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      <div className="absolute top-5 left-4 flex items-center gap-2.5">
        <img src={viewStory?.user?.profile_picture} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-sky-400/50" />
        <div className="text-white flex items-center gap-1.5">
          <span className="text-sm font-semibold">{viewStory?.user?.full_name}</span>
          <BadgeCheck className="w-4 h-4 text-sky-400" />
        </div>
      </div>

      {/* ✅ Delete button — sirf owner ko dikhega */}
      {isOwner && (
        <button onClick={handleDelete} disabled={deleting}
          className="absolute top-4 right-16 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose-500/30 text-white hover:text-rose-400 transition cursor-pointer">
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <button onClick={() => setViewStory(null)}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer">
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">{renderContent()}</div>
    </div>
  );
};

export default StoryViewer;
