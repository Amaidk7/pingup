import React, { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {

  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user.value);

  const { getToken } = useAuth();

  const handleSubmit = async () => {

    if (!images.length && !content) {
      return toast.error("Please add at least one image or text");
    }

    setLoading(true);

    const postType =
      images.length && content
        ? "text_with_image"
        : images.length
        ? "image"
        : "text";

    try {

      const formData = new FormData();

      formData.append("content", content);
      formData.append("post_type", postType);

      images.forEach((image) => {
        formData.append("images", image);
      });

      const { data } = await api.post("/api/post/add", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {

        navigate("/");

      } else {

        throw new Error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }

    setLoading(false);
  };

  return (

    <div className="min-h-screen bg-slate-50 overflow-y-auto no-scrollbar">

      <div className="max-w-xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Post</h1>
          <p className="text-sm text-slate-400 mt-1">Share your thoughts with the world</p>
        </div>

        {/* Post Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* User Info */}
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

          {/* Textarea */}
          <div className="px-5 py-4">
            <textarea
              className="w-full resize-none text-sm text-slate-700 placeholder-slate-300 outline-none min-h-[120px] leading-relaxed"
              placeholder="What's on your mind?"
              onChange={(e) => setContent(e.target.value)}
              value={content}
            />
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="px-5 pb-4 flex flex-wrap gap-2">
              {images.map((image, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    className="h-24 w-24 object-cover rounded-xl"
                    alt=""
                  />
                  <button
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center cursor-pointer shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50 bg-slate-50/50">

            <label
              htmlFor="images"
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-700 transition cursor-pointer py-2 px-3 rounded-xl hover:bg-white"
            >
              <ImagePlus className="w-4 h-4" />
              Add Photo
            </label>

            <input
              type="file"
              id="images"
              accept="image/*"
              hidden
              multiple
              onChange={(e) =>
                setImages([...images, ...Array.from(e.target.files)])
              }
            />

            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Uploading...",
                  success: <p>Post Added</p>,
                  error: <p>Post Not Added</p>,
                })
              }
              className="text-sm bg-slate-900 hover:bg-slate-700 active:scale-95 transition text-white font-semibold px-6 py-2 rounded-xl cursor-pointer disabled:opacity-50"
            >
              Publish
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

export default CreatePost;
