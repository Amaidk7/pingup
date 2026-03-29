import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const CreateReel = () => {
  const [video, setVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);
  const navigate = useNavigate();

  const MAX_SIZE_MB = 100;
  const MAX_DURATION = 60;

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      return toast.error("Please select a video file");
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return toast.error(`Video must be under ${MAX_SIZE_MB}MB`);
    }

    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoEl.src);
      if (videoEl.duration > MAX_DURATION) {
        toast.error("Video must be under 60 seconds");
        return;
      }
      setVideo(file);
      setPreviewUrl(URL.createObjectURL(file));
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

      const token = await getToken();
      const { data } = await api.post("/api/reel/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Reel uploaded!");
        navigate("/reels");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto no-scrollbar">
      <div className="max-w-lg mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Reel</h1>
          <p className="text-sm text-slate-400 mt-1">Share a short video with your followers</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* User info */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-slate-50">
            <img
              src={user?.profile_picture}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div>
              <h2 className="font-semibold text-slate-900 text-sm">{user?.full_name}</h2>
              <p className="text-xs text-slate-400">@{user?.username}</p>
            </div>
          </div>

          <div className="p-5 space-y-4">

            {/* Video Upload */}
            {!previewUrl ? (
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-200 flex items-center justify-center mb-3 transition">
                  <Upload className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">Click to upload video</p>
                <p className="text-xs text-slate-400 mt-1">Max 60 seconds · Max 100MB</p>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleVideoSelect}
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-80">
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                  controls
                />
                <button
                  onClick={() => { setVideo(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Caption */}
            <textarea
              rows={3}
              className="w-full px-4 py-3 text-sm text-slate-700 placeholder-slate-300 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 transition resize-none"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

          </div>

          {/* Submit */}
          <div className="px-5 pb-5">
            <button
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Uploading reel...",
                  success: "Reel uploaded!",
                  error: "Upload failed",
                })
              }
              disabled={loading || !video}
              className="w-full py-3 bg-slate-900 hover:bg-slate-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Share Reel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateReel;
