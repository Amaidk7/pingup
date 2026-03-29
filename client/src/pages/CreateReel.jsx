import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const CreateReel = () => {
  const [video, setVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast.error("Please select a video file");
    if (file.size > 100 * 1024 * 1024) return toast.error("Video must be under 100MB");
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > 60) { toast.error("Video must be under 60 seconds"); return; }
      setVideo(file); setPreviewUrl(URL.createObjectURL(file));
    };
    videoEl.src = URL.createObjectURL(file);
  };

  const handleSubmit = async () => {
    if (!video) return toast.error("Please select a video");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("video", video);
      formData.append("caption", caption);
      const { data } = await api.post("/api/reel/create", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) { toast.success("Reel uploaded!"); navigate("/reels"); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen overflow-y-auto no-scrollbar ${isDark ? "bg-black" : "bg-slate-50"}`}>
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Create Reel</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Share a short video with your followers</p>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className={`flex items-center gap-3 px-5 pt-5 pb-4 border-b ${isDark ? "border-white/5" : "border-slate-50"}`}>
            <img src={user?.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{user?.full_name}</h2>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>@{user?.username}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {!previewUrl ? (
              <label htmlFor="video-upload"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition group ${
                  isDark ? "border-white/10 hover:border-sky-500/30 hover:bg-white/2" : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition ${isDark ? "bg-white/5 group-hover:bg-white/10" : "bg-slate-100 group-hover:bg-slate-200"}`}>
                  <Upload className={`w-5 h-5 ${isDark ? "text-white/30" : "text-slate-400"}`} />
                </div>
                <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-slate-600"}`}>Click to upload video</p>
                <p className={`text-xs mt-1 ${isDark ? "text-white/20" : "text-slate-400"}`}>Max 60 seconds · Max 100MB</p>
                <input id="video-upload" type="file" accept="video/*" hidden onChange={handleVideoSelect} />
              </label>
            ) : (
              <div className={`relative rounded-2xl overflow-hidden aspect-[9/16] max-h-80 ${isDark ? "bg-zinc-800" : "bg-slate-200"}`}>
                <video src={previewUrl} className="w-full h-full object-cover" controls />
                <button onClick={() => { setVideo(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/70 text-white rounded-full flex items-center justify-center cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <textarea rows={3}
              className={`w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition resize-none border ${
                isDark
                  ? "text-white/80 placeholder-white/20 bg-zinc-800 border-white/5 focus:border-sky-500/40"
                  : "text-slate-700 placeholder-slate-300 bg-slate-50 border-slate-200 focus:border-slate-400"
              }`}
              placeholder="Write a caption..."
              value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={() => toast.promise(handleSubmit(), { loading: "Uploading reel...", success: "Reel uploaded!", error: "Upload failed" })}
              disabled={loading || !video}
              className={`w-full py-3 text-sm font-semibold rounded-xl active:scale-95 transition cursor-pointer disabled:opacity-30 ${
                isDark ? "bg-sky-500 hover:bg-sky-400 text-black" : "bg-slate-900 hover:bg-slate-700 text-white"
              }`}>
              Share Reel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReel;
