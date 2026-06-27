import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

const PostCard = ({ post, onDelete }) => {
  const { isDark } = useTheme();

  const postWithHashtags = post.content?.replace(
    /(#\w+)/g,
    `<span class="${isDark ? "text-sky-400" : "text-slate-700"} font-semibold">$1</span>`
  );

  const [likes, setLikes] = useState(post.likes_count || []);
  const [deleting, setDeleting] = useState(false);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const isLiked = likes.includes(currentUser?._id);
  const isOwner = currentUser?._id === post.user?._id;

  const handleLike = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(`/api/post/like/${post._id}`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) {
        toast.success(data.message);
        setLikes((prev) => prev.includes(currentUser?._id)
          ? prev.filter((id) => id !== currentUser?._id)
          : [...prev, currentUser?._id]);
      } else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setDeleting(true);
      const token = await getToken();
      const { data } = await api.delete(`/api/post/delete/${post._id}`,
        { headers: { Authorization: `Bearer ${token}` } });
      if (data.success) { toast.success("Post deleted"); if (onDelete) onDelete(post._id); }
      else toast.error(data.message);
    } catch (error) { toast.error(error.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 p-5 space-y-4 w-full max-w-2xl ${
      deleting ? "opacity-50 pointer-events-none" : ""
    } ${isDark
      ? "bg-zinc-900 border-white/5 hover:border-white/10"
      : "bg-white border-slate-100 shadow-sm hover:shadow-md"
    }`}>

      <div className="flex items-center justify-between">
        <div onClick={() => navigate("/profile/" + post.user._id)}
          className="inline-flex items-center gap-3 cursor-pointer group">
          <img src={post.user?.profile_picture || null} alt=""
            className={`w-10 h-10 rounded-full object-cover ring-2 transition ${isDark ? "ring-white/10 group-hover:ring-white/20" : "ring-slate-100 group-hover:ring-slate-300"}`} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold text-sm transition ${isDark ? "text-white group-hover:text-white/70" : "text-slate-900 group-hover:text-slate-600"}`}>
                {post.user?.full_name}
              </span>
              <BadgeCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className={`text-xs tracking-wide ${isDark ? "text-white/30" : "text-slate-400"}`}>
              @{post.user?.username} · {moment(post.createdAt).fromNow()}
            </div>
          </div>
        </div>

        {isOwner && (
          <button onClick={handleDelete} disabled={deleting}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
              isDark ? "text-white/20 hover:text-rose-400 hover:bg-rose-400/10" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
            }`}>
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {post.content && (
        <div className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-white/80" : "text-slate-700"}`}
          dangerouslySetInnerHTML={{ __html: postWithHashtags }} />
      )}

      {post.image_urls?.length > 0 && (
        <div className={`grid gap-2 ${post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.image_urls?.map((img, index) => (
            <img src={img || null} key={index}
              className={`w-full rounded-xl ${post.image_urls.length === 1 ? "object-contain max-h-150" : "object-cover h-48"}`} alt="" />
          ))}
        </div>
      )}

      <div className={`flex items-center gap-5 pt-3 border-t ${isDark ? "border-white/5" : "border-slate-50"}`}>
        <button onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 cursor-pointer group ${
            isLiked ? "text-rose-400" : isDark ? "text-white/30 hover:text-rose-400" : "text-slate-400 hover:text-rose-400"
          }`}>
          <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${isLiked ? "fill-rose-400" : ""}`} />
          <span>{likes.length}</span>
        </button>
        <button className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 group cursor-pointer ${isDark ? "text-white/30 hover:text-white/70" : "text-slate-400 hover:text-slate-700"}`}>
          <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" /><span>12</span>
        </button>
        <button className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 group cursor-pointer ${isDark ? "text-white/30 hover:text-white/70" : "text-slate-400 hover:text-slate-700"}`}>
          <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" /><span>7</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
