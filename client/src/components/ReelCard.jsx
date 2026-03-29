import React, { useRef, useState, useEffect } from "react";
import { Heart, Trash2, Volume2, VolumeX, BadgeCheck } from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import moment from "moment";

const ReelCard = ({ reel, isActive, onDelete }) => {
  const videoRef = useRef(null);
  const [likes, setLikes] = useState(reel.likes_count || []);
  const [muted, setMuted] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const isLiked = likes.includes(currentUser?._id);
  const isOwner = currentUser?._id === reel.user?._id;

  // play/pause based on visibility
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleLike = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        `/api/reel/like/${reel._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setLikes((prev) =>
          prev.includes(currentUser?._id)
            ? prev.filter((id) => id !== currentUser?._id)
            : [...prev, currentUser?._id]
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this reel?")) return;
    try {
      setDeleting(true);
      const token = await getToken();
      const { data } = await api.delete(`/api/reel/delete/${reel._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Reel deleted");
        if (onDelete) onDelete(reel._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-black snap-start snap-always">

      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="h-full w-full object-cover"
        loop
        muted={muted}
        playsInline
        onClick={() => setMuted((prev) => !prev)}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

      {/* Top — mute button */}
      <button
        onClick={() => setMuted((prev) => !prev)}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* Bottom left — user info + caption */}
      <div className="absolute bottom-6 left-4 right-16 space-y-3">

        {/* User */}
        <div
          onClick={() => navigate("/profile/" + reel.user?._id)}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <img
            src={reel.user?.profile_picture}
            alt=""
            className="w-9 h-9 rounded-full object-cover border-2 border-white/60"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white font-semibold text-sm">
                {reel.user?.full_name}
              </span>
              <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <p className="text-white/50 text-xs">{moment(reel.createdAt).fromNow()}</p>
          </div>
        </div>

        {/* Caption */}
        {reel.caption && (
          <p className="text-white text-sm leading-relaxed max-w-xs">
            {reel.caption}
          </p>
        )}

      </div>

      {/* Right side — actions */}
      <div className="absolute bottom-6 right-4 flex flex-col items-center gap-5">

        {/* Like */}
        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1 cursor-pointer group"
        >
          <div className={`w-10 h-10 flex items-center justify-center rounded-full transition ${isLiked ? "bg-rose-500/20" : "bg-black/30 hover:bg-black/50"}`}>
            <Heart
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${isLiked ? "fill-rose-500 text-rose-500" : "text-white"}`}
            />
          </div>
          <span className="text-white text-xs font-medium">{likes.length}</span>
        </button>

        {/* Delete — sirf owner ko */}
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 hover:bg-rose-500/30 text-white hover:text-rose-400 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

      </div>

    </div>
  );
};

export default ReelCard;
