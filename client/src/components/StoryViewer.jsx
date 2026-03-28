import React, { useEffect, useState } from "react";
import { BadgeCheck, X } from "lucide-react";

const StoryViewer = ({ viewStory, setViewStory }) => {

  const [progress, setProgress] = useState(0);

  useEffect(() => {

    let timer, progressInterval;

    if (viewStory && viewStory.media_type !== "video") {

      setProgress(0);

      const duration = 10000;
      const setTime = 100;

      let elapsed = 0;

      progressInterval = setInterval(() => {

        elapsed += setTime;
        setProgress((elapsed / duration) * 100);

      }, setTime);

      timer = setTimeout(() => {

        setViewStory(null);

      }, duration);

    }

    return () => {

      clearTimeout(timer);
      clearInterval(progressInterval);

    };

  }, [viewStory, setViewStory]);

  const handleClose = () => {
    setViewStory(null);
  };

  if (!viewStory) return null;

  const renderContent = () => {

    switch (viewStory.media_type) {

      case "image":

        return (
          <img
            src={viewStory.media_url}
            alt=""
            className="max-w-full max-h-screen object-contain rounded-xl"
          />
        );

      case "video":

        return (
          <video
            onEnded={() => setViewStory(null)}
            src={viewStory.media_url}
            className="max-h-screen rounded-xl"
            controls
            autoPlay
          />
        );

      case "text":

        return (
          <div className="w-full h-full flex items-center justify-center p-10 text-white text-2xl text-center font-light leading-relaxed">
            {viewStory.content}
          </div>
        );

      default:
        return null;

    }
  };

  return (

    <div
      className="fixed inset-0 h-screen z-50 flex items-center justify-center"
      style={{
        backgroundColor:
          viewStory.media_type === "text"
            ? viewStory.background_color
            : "#000000",
      }}
    >

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* User Info */}
      <div className="absolute top-5 left-4 flex items-center gap-2.5">
        <img
          src={viewStory?.user?.profile_picture}
          alt=""
          className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
        />
        <div className="text-white flex items-center gap-1.5">
          <span className="text-sm font-semibold">{viewStory?.user?.full_name}</span>
          <BadgeCheck className="w-4 h-4 text-sky-300" />
        </div>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="max-w-[90vw] max-h-[80vh] flex items-center justify-center">
        {renderContent()}
      </div>

    </div>
  );
};

export default StoryViewer;
