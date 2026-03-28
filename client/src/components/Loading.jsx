import React from "react";

const Loading = ({ height = "100vh" }) => {
  return (
    <div
      style={{ height }}
      className="flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-slate-800 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <span className="text-xs tracking-[0.2em] text-slate-400 uppercase font-light animate-pulse">
          Loading
        </span>
      </div>
    </div>
  );
};

export default Loading;
