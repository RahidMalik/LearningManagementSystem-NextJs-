"use client";

import React, { useRef, useEffect } from "react";
import { Plyr, APITypes } from "plyr-react";
import "plyr/dist/plyr.css";
import { Rewind, FastForward } from "lucide-react";

interface Props {
  videoUrl: string;
}

export const CybexPlayer = ({ videoUrl }: Props) => {
  const playerRef = useRef<APITypes>(null);

  // 10s Skip Function (Keyboard ke liye)
  const handleManualSkip = (seconds: number) => {
    if (!playerRef.current?.plyr) return;
    const player = playerRef.current.plyr;
    const currentTime = player.currentTime;
    player.currentTime = currentTime + seconds;

    // Visual Animation
    const dir = seconds > 0 ? "forward" : "rewind";
    const icon = document.getElementById(`${dir}-icon-plyr`);
    if (icon) {
      icon.classList.remove("opacity-0", "scale-50");
      icon.classList.add("opacity-100", "scale-100", "bg-black/60");
      setTimeout(() => {
        icon.classList.remove("opacity-100", "scale-100", "bg-black/60");
        icon.classList.add("opacity-0", "scale-50");
      }, 700);
    }
  };

  // Keyboard Shortcuts (Arrows & Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
        return;

      if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleManualSkip(-10);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleManualSkip(10);
      } else if (e.code === "Space") {
        e.preventDefault();
        playerRef.current?.plyr.togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* 🚀 FIX: Video ko crop hone se rokne aur controls ko allow karne ke liye custom CSS classes */}
      <div className="absolute inset-0 w-full h-full [&_.plyr]:h-full [&_.plyr__video-wrapper]:h-full [&_.plyr__video-wrapper_video]:object-contain![&_.plyr__video-wrapper_video]:h-full!">
        <Plyr
          ref={playerRef}
          source={{
            type: "video",
            sources: [{ src: videoUrl, type: "video/mp4" }],
          }}
          options={{
            controls: [
              "play-large",
              "play",
              "progress",
              "current-time",
              "mute",
              "volume",
              "settings",
              "fullscreen",
            ],
            keyboard: { focused: true, global: true },
            tooltips: { controls: true, seek: true },
            clickToPlay: true,
            ratio: "16:9",
          }}
        />
      </div>

      <div className="absolute left-[15%] top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <div
          id="rewind-icon-plyr"
          className="flex flex-col items-center justify-center w-20 h-20 rounded-full text-white opacity-0 scale-50 transition-all duration-300"
        >
          <Rewind size={32} fill="white" />
          <span className="text-xs font-bold mt-1">-10s</span>
        </div>
      </div>
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <div
          id="forward-icon-plyr"
          className="flex flex-col items-center justify-center w-20 h-20 rounded-full text-white opacity-0 scale-50 transition-all duration-300"
        >
          <FastForward size={32} fill="white" />
          <span className="text-xs font-bold mt-1">+10s</span>
        </div>
      </div>
    </div>
  );
};
