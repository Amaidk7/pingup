import { BadgeCheck, Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import React, { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post, onDelete }) => {

  const postWithHashtags = post.content?.replace(
    /(#\w+)/g,
    '<span class="text-slate-700 font-semibold">$1</span>'
  );

  const [likes, setLikes] = useState(post.likes_count || []);
  const [deleting, setDeleting] = useState(false);

  const currentUser = useSelector((state) => state.user.value);

  const { getToken } = useAuth();

  const navigate = useNavigate();

  const isOwner = currentUser?._id === post.user?._id;

  const handleLike = async () => {

    try {

      const token = await getToken();

      const { data } = await api.post(
        `/api/post/like/${post._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {

        toast.success(data.message);

        setLikes((prev) => {

          if (prev.includes(currentUser?._id)) {

            return prev.filter((id) => id !== currentUser?._id);

          } else {

            return [...prev, currentUser?._id];

          }

        });

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    }

  };

  const handleDelete = async () => {

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {

      setDeleting(true);

      const token = await getToken();

      const { data } = await api.delete(
        `/api/post/delete/${post._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (data.success) {

        toast.success("Post deleted");

        // parent component ko notify karo list se remove karne ke liye
        if (onDelete) onDelete(post._id);

      } else {

        toast.error(data.message);

      }

    } catch (error) {

      toast.error(error.message);

    } finally {

      setDeleting(false);

    }

  };

  const isLiked = likes.includes(currentUser?._id);

  return (

    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 space-y-4 w-full max-w-2xl ${deleting ? "opacity-50 pointer-events-none" : ""}`}>

      {/* User Info */}
      <div className="flex items-center justify-between">

        <div
          onClick={() => navigate("/profile/" + post.user._id)}
          className="inline-flex items-center gap-3 cursor-pointer group"
        >

          <div className="relative">
            <img
              src={post.user?.profile_picture || null}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 group-hover:ring-slate-300 transition"
            />
          </div>

          <div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-sm group-hover:text-slate-600 transition">
                {post.user?.full_name}
              </span>
              <BadgeCheck className="w-4 h-4 text-sky-500" />
            </div>

            <div className="text-slate-400 text-xs tracking-wide">
              @{post.user?.username} · {moment(post.createdAt).fromNow()}
            </div>

          </div>

        </div>

        {/* Delete button — sirf owner ko dikhega */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Delete post"
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-slate-700 text-sm leading-relaxed whitespace-pre-line"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}

      {/* Images */}
      {post.image_urls?.length > 0 && (
        <div className={`grid gap-2 ${post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {post.image_urls?.map((img, index) => (
            <img
              src={img || null}
              key={index}
              className={`w-full object-cover rounded-xl ${
                post.image_urls.length === 1 ? "max-h-80" : "h-48"
              }`}
              alt=""
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-slate-50">

        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 cursor-pointer group ${
            isLiked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
              isLiked ? "fill-rose-500" : ""
            }`}
          />
          <span>{likes.length}</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-all duration-200 group cursor-pointer">
          <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>12</span>
        </button>

        <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-all duration-200 group cursor-pointer">
          <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span>7</span>
        </button>

      </div>

    </div>

  );

};

export default PostCard;
