import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import ReelCard from "../components/ReelCard";

// Reels page is always fullscreen black — same for dark/light
const Reels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const { getToken } = useAuth();

  const fetchReels = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/api/reel/get", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setReels(data.reels || []);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActiveIndex(Number(entry.target.dataset.index));
        });
      },
      { root: container, threshold: 0.6 },
    );
    const children = container.querySelectorAll("[data-index]");
    children.forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    fetchReels();
  }, []);

  const handleDelete = (reelId) =>
    setReels((prev) => prev.filter((r) => r._id !== reelId));

  if (loading) return <Loading />;

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
    >
      {reels.length === 0 ? (
        <div className="h-screen flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-3xl">🎬</span>
          </div>
          <p className="text-white/40 font-medium">No reels yet</p>
          <p className="text-white/20 text-sm mt-1">
            Upload a reel to get started
          </p>
        </div>
      ) : (
        reels.map((reel, index) => (
          <div key={reel._id} data-index={index}>
            <ReelCard
              reel={reel}
              isActive={activeIndex === index}
              onDelete={handleDelete}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default Reels;
