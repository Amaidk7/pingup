// ── CreatePost.jsx ──
import React, { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    if (!images.length && !content) return toast.error("Please add at least one image or text");
    setLoading(true);
    const postType = images.length && content ? "text_with_image" : images.length ? "image" : "text";
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("post_type", postType);
      images.forEach((image) => { formData.append("images", image); });
      const { data } = await api.post("/api/post/add", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) navigate("/");
      else throw new Error(data.message);
    } catch (error) { toast.error(error.message); }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen overflow-y-auto no-scrollbar bg-transparent`}>
      <div className="max-w-xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Create Post</h1>
          <p className={`text-sm mt-1 ${isDark ? "text-white/30" : "text-slate-400"}`}>Share your thoughts with the world</p>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-zinc-900 border-white/5" : "bg-white border-slate-100 shadow-sm"}`}>
          <div className={`flex items-center gap-3 px-5 pt-5 pb-4 border-b ${isDark ? "border-white/5" : "border-slate-50"}`}>
            <img src={user?.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{user?.full_name}</h2>
              <p className={`text-xs ${isDark ? "text-white/30" : "text-slate-400"}`}>@{user?.username}</p>
            </div>
          </div>

          <div className="px-5 py-4">
            <textarea
              className={`w-full resize-none text-sm outline-none min-h-[120px] leading-relaxed bg-transparent ${
                isDark ? "text-white/80 placeholder-white/20" : "text-slate-700 placeholder-slate-300"
              }`}
              placeholder="What's on your mind?"
              onChange={(e) => setContent(e.target.value)} value={content} />
          </div>

          {images.length > 0 && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(image)} className="h-24 w-24 object-cover rounded-xl" alt="" />
                  <button onClick={() => setImages(images.filter((_, index) => index !== i))}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={`flex items-center justify-between px-5 py-3 border-t ${isDark ? "border-white/5 bg-zinc-950/50" : "border-slate-50 bg-slate-50/50"}`}>
            <label htmlFor="images"
              className={`flex items-center gap-2 text-xs font-medium transition cursor-pointer py-2 px-3 rounded-xl ${
                isDark ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-slate-400 hover:text-slate-700 hover:bg-white"
              }`}>
              <ImagePlus className="w-4 h-4" /> Add Photo
            </label>
            <input type="file" id="images" accept="image/*" hidden multiple
              onChange={(e) => setImages([...images, ...Array.from(e.target.files)])} />
            <button disabled={loading}
              onClick={() => toast.promise(handleSubmit(), { loading: "Uploading...", success: <p>Post Added</p>, error: <p>Post Not Added</p> })}
              className={`text-sm font-semibold px-6 py-2 rounded-xl active:scale-95 transition cursor-pointer disabled:opacity-40 ${
                isDark ? "bg-sky-500 text-black hover:bg-sky-400" : "bg-slate-900 text-white hover:bg-slate-700"
              }`}>Publish</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
