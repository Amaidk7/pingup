import React, { useState } from "react";
import { ArrowLeft, ImageIcon, Sparkles, Type } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";

// StoryModal is always dark (fullscreen overlay) — no theme needed inside
const StoryModal = ({ setShowModal, fetchStories }) => {
  const bgColors = ["#0f172a", "#1e3a5f", "#312e81", "#4c1d95", "#831843", "#134e4a"];

  const [mode, setMode] = useState("text");
  const [background, setBackground] = useState(bgColors[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE_MB = 50;

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("video")) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) { toast.error(`Video cannot exceed ${MAX_VIDEO_SIZE_MB}MB`); return; }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > MAX_VIDEO_DURATION) { toast.error("Video cannot exceed 1 minute."); }
          else { setMedia(file); setPreviewUrl(URL.createObjectURL(file)); setText(""); setMode("media"); }
        };
        video.src = URL.createObjectURL(file);
      } else if (file.type.startsWith("image")) {
        setMedia(file); setPreviewUrl(URL.createObjectURL(file)); setText(""); setMode("media");
      }
    }
  };

  const handleCreateStory = async () => {
    const media_type = mode === "media" ? (media?.type?.startsWith("image") ? "image" : "video") : "text";
    if (media_type === "text" && !text) { toast.error("Please enter some text"); return; }
    const formData = new FormData();
    formData.append("content", text);
    formData.append("media_type", media_type);
    formData.append("background_color", background);
    if (media) formData.append("media", media);
    const token = await getToken();
    try {
      const { data } = await api.post("/api/story/create", formData, { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { setShowModal(false); toast.success("Story created!"); fetchStories(); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowModal(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-white tracking-wide">Create Story</h2>
          <span className="w-9"></span>
        </div>

        <div className="rounded-2xl h-[420px] flex items-center justify-center relative overflow-hidden shadow-2xl"
          style={{ backgroundColor: mode === "text" ? background : "#000" }}>
          {mode === "text" && (
            <textarea className="bg-transparent text-white w-full h-full p-8 text-lg resize-none focus:outline-none placeholder-white/30 text-center"
              placeholder="What's on your mind?" onChange={(e) => setText(e.target.value)} value={text} />
          )}
          {mode === "media" && previewUrl && (
            media?.type?.startsWith("image")
              ? <img src={previewUrl} alt="" className="object-contain max-h-full rounded-2xl" />
              : <video src={previewUrl} className="object-contain max-h-full rounded-2xl" />
          )}
        </div>

        {mode === "text" && (
          <div className="flex gap-2 mt-4 px-1">
            {bgColors.map((color) => (
              <button key={color}
                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${background === color ? "scale-125 ring-2 ring-sky-400 ring-offset-2 ring-offset-black" : "hover:scale-110"}`}
                style={{ backgroundColor: color }} onClick={() => setBackground(color)} />
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => { setMode("text"); setMedia(null); setPreviewUrl(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${mode === "text" ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15"}`}>
            <Type className="w-4 h-4" /> Text
          </button>
          <label className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${mode === "media" ? "bg-white text-black" : "bg-white/10 text-white/60 hover:bg-white/15"}`}>
            <input onChange={handleMediaUpload} type="file" accept="image/*,video/*" className="hidden" />
            <ImageIcon className="w-4 h-4" /> Photo/Video
          </label>
        </div>

        <button onClick={() => toast.promise(handleCreateStory(), { loading: "Creating..." })}
          className="flex items-center justify-center gap-2 text-black bg-sky-400 hover:bg-sky-300 active:scale-95 py-3 mt-3 w-full rounded-xl text-sm font-semibold transition cursor-pointer">
          <Sparkles className="w-4 h-4" /> Share Story
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
