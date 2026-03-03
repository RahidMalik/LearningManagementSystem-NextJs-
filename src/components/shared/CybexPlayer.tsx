"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Plyr, APITypes } from "plyr-react";
import "plyr/dist/plyr.css";
import {
  Rewind,
  FastForward,
  Gauge,
  PictureInPicture2,
  Keyboard,
  X,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface Props {
  videoUrl: string;
  lectureId?: string; // localStorage key ke liye
  onEnded?: () => void; // auto-play next lecture
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const SHORTCUTS = [
  { key: "Space", label: "Play / Pause" },
  { key: "←", label: "Rewind 10s" },
  { key: "→", label: "Forward 10s" },
  { key: "↑", label: "Volume Up" },
  { key: "↓", label: "Volume Down" },
  { key: "F", label: "Fullscreen" },
  { key: "P", label: "Picture-in-Picture" },
  { key: "S", label: "Speed Cycle" },
  { key: "R", label: "Restart from beginning" },
];

export const CybexPlayer = ({ videoUrl, lectureId, onEnded }: Props) => {
  const playerRef = useRef<APITypes>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const saveInterval = useRef<NodeJS.Timeout | null>(null);

  const [speed, setSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);
  const [isPip, setIsPip] = useState(false);

  const storageKey = lectureId ? `plyr-pos-${lectureId}` : null;

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const getPlayer = () => playerRef.current?.plyr as any;

  const handleManualSkip = useCallback((seconds: number) => {
    const p = getPlayer();
    if (!p) return;
    p.currentTime = Math.max(0, p.currentTime + seconds);
    const dir = seconds > 0 ? "forward" : "rewind";
    const icon = document.getElementById(`${dir}-icon-plyr`);
    if (icon) {
      icon.classList.remove("opacity-0", "scale-50");
      icon.classList.add("opacity-100", "scale-100", "bg-black/60");
      setTimeout(() => {
        icon.classList.remove("opacity-100", "scale-100", "bg-black/60");
        icon.classList.add("opacity-0", "scale-50");
      }, 350);
    }
  }, []);

  const handleTap = useCallback(
    (action: "left" | "center" | "right") => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
        clickTimeout.current = null;
        if (action === "left") handleManualSkip(-10);
        if (action === "right") handleManualSkip(10);
      } else {
        clickTimeout.current = setTimeout(() => {
          getPlayer()?.togglePlay();
          clickTimeout.current = null;
        }, 200);
      }
    },
    [handleManualSkip],
  );

  const applySpeed = useCallback(
    (s: number) => {
      const p = getPlayer();
      if (p) p.speed = s;
      setSpeed(s);
      setShowSpeedMenu(false);
      if (lectureId) localStorage.setItem(`plyr-speed-${lectureId}`, String(s));
    },
    [lectureId],
  );

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(speed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    applySpeed(next);
  }, [speed, applySpeed]);

  const togglePip = useCallback(async () => {
    const p = getPlayer();
    if (!p) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPip(false);
      } else {
        const video = p.media as HTMLVideoElement;
        await video?.requestPictureInPicture();
        setIsPip(true);
      }
    } catch (e) {
      console.warn("PiP not supported", e);
    }
  }, []);

  // ─────────────────────────────────────────────
  // On Mount — restore saved position & speed
  // ─────────────────────────────────────────────
  useEffect(() => {
    const p = getPlayer();
    if (!p) return;

    // Restore speed
    if (lectureId) {
      const savedSpeed = parseFloat(
        localStorage.getItem(`plyr-speed-${lectureId}`) || "1",
      );
      if (!isNaN(savedSpeed)) {
        setSpeed(savedSpeed);
        p.speed = savedSpeed;
      }
    }

    // Restore volume
    const savedVol = parseFloat(localStorage.getItem("plyr-volume") || "1");
    if (!isNaN(savedVol)) p.volume = savedVol;

    // Restore position — show resume prompt
    if (storageKey) {
      const saved = parseFloat(localStorage.getItem(storageKey) || "0");
      if (saved > 10) setResumePrompt(saved);
    }

    // Save position every 3s
    saveInterval.current = setInterval(() => {
      const cp = getPlayer();
      if (!cp || !storageKey) return;
      const t = cp.currentTime;
      if (t > 5) localStorage.setItem(storageKey, String(t));
      localStorage.setItem("plyr-volume", String(cp.volume ?? 1));
    }, 3000);

    // Auto-play next on ended
    p.on?.("ended", () => {
      if (storageKey) localStorage.removeItem(storageKey);
      onEnded?.();
    });

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [videoUrl]);

  // ─────────────────────────────────────────────
  // Keyboard shortcuts
  // ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName || "";
      if (["INPUT", "TEXTAREA"].includes(tag)) return;

      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          handleManualSkip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          handleManualSkip(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          {
            const p = getPlayer();
            if (p) p.volume = Math.min(1, p.volume + 0.1);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          {
            const p = getPlayer();
            if (p) p.volume = Math.max(0, p.volume - 0.1);
          }
          break;
        case "Space":
          e.preventDefault();
          getPlayer()?.togglePlay();
          break;
        case "KeyF":
          e.preventDefault();
          getPlayer()?.fullscreen?.toggle();
          break;
        case "KeyP":
          e.preventDefault();
          togglePip();
          break;
        case "KeyS":
          e.preventDefault();
          cycleSpeed();
          break;
        case "KeyR":
          e.preventDefault();
          {
            const p = getPlayer();
            if (p) p.currentTime = 0;
          }
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleManualSkip, togglePip, cycleSpeed]);

  // ─────────────────────────────────────────────
  // Resume from saved position
  // ─────────────────────────────────────────────
  const doResume = () => {
    const p = getPlayer();
    if (p && resumePrompt) p.currentTime = resumePrompt;
    setResumePrompt(null);
    p?.play();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group/player">
      {/* ── Plyr core ── */}
      <div className="absolute inset-0 w-full h-full [&_.plyr]:h-full [&_.plyr__video-wrapper]:h-full [&_.plyr__video-wrapper_video]:object-contain! [&_.plyr__video-wrapper_video]:h-full!">
        <Plyr
          ref={playerRef}
          source={{
            type: "video",
            sources: [{ src: videoUrl, type: "video/mp4" }],
          }}
          options={
            {
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
              keyboard: { focused: true, global: false },
              tooltips: { controls: true, seek: true },
              clickToPlay: false,
              speed: { selected: speed, options: SPEEDS },
            } as any
          }
        />
      </div>

      {/* ── Smart tap layer ── */}
      <div className="absolute top-0 left-0 right-0 bottom-14 z-10 flex cursor-pointer">
        {(["left", "center", "right"] as const).map((zone) => (
          <div
            key={zone}
            className="w-1/3 h-full"
            onClick={(e) => {
              e.stopPropagation();
              handleTap(zone);
            }}
          />
        ))}
      </div>

      {/* ── Skip icons ── */}
      {[
        {
          id: "rewind-icon-plyr",
          pos: "left-[15%]",
          icon: Rewind,
          label: "-10s",
        },
        {
          id: "forward-icon-plyr",
          pos: "right-[15%]",
          icon: FastForward,
          label: "+10s",
        },
      ].map(({ id, pos, icon: Icon, label }) => (
        <div
          key={id}
          className={`absolute ${pos} top-1/2 -translate-y-1/2 pointer-events-none z-20`}
        >
          <div
            id={id}
            className="flex flex-col items-center justify-center w-20 h-20 rounded-full text-white opacity-0 scale-50 transition-all duration-300"
          >
            <Icon size={32} fill="white" />
            <span className="text-xs font-bold mt-1">{label}</span>
          </div>
        </div>
      ))}

      {/* ── Custom control bar (top-right) ── */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
        {/* Speed button */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu((v) => !v)}
            className="flex items-center gap-1.5 bg-black/70 backdrop-blur text-white text-xs font-black px-3 py-1.5 rounded-full hover:bg-black/90 transition-all border border-white/10"
          >
            <Gauge size={13} />
            {speed}x
          </button>
          {showSpeedMenu && (
            <div className="absolute top-9 right-0 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-40 w-28">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => applySpeed(s)}
                  className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                    speed === s
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  {s === 1 ? "Normal" : `${s}x`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PiP button */}
        <button
          onClick={togglePip}
          title="Picture-in-Picture (P)"
          className={`p-2 rounded-full backdrop-blur border border-white/10 transition-all ${
            isPip
              ? "bg-blue-500 text-white"
              : "bg-black/70 text-white hover:bg-black/90"
          }`}
        >
          <PictureInPicture2 size={14} />
        </button>

        {/* Restart button */}
        <button
          onClick={() => {
            const p = getPlayer();
            if (p) {
              p.currentTime = 0;
              p.play();
            }
          }}
          title="Restart (R)"
          className="p-2 rounded-full bg-black/70 backdrop-blur text-white hover:bg-black/90 border border-white/10 transition-all"
        >
          <RotateCcw size={14} />
        </button>

        {/* Shortcuts button */}
        <button
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts"
          className="p-2 rounded-full bg-black/70 backdrop-blur text-white hover:bg-black/90 border border-white/10 transition-all"
        >
          <Keyboard size={14} />
        </button>
      </div>

      {/* ── Resume prompt ── */}
      {resumePrompt && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900/95 backdrop-blur border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl">
            <div>
              <p className="text-white text-xs font-bold">
                Resume from {formatTime(resumePrompt)}?
              </p>
              <p className="text-zinc-500 text-[10px]">
                You left off here last time
              </p>
            </div>
            <button
              onClick={doResume}
              className="bg-white text-black text-xs font-black px-4 py-1.5 rounded-full hover:bg-zinc-200 transition-all flex items-center gap-1"
            >
              Resume <ChevronRight size={12} />
            </button>
            <button
              onClick={() => setResumePrompt(null)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Keyboard shortcuts overlay ── */}
      {showShortcuts && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-72 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard size={16} className="text-blue-400" />
                <h3 className="text-white font-black text-sm">
                  Keyboard Shortcuts
                </h3>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {SHORTCUTS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-zinc-400 text-xs">{label}</span>
                  <kbd className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
            <p className="text-zinc-700 text-[10px] mt-4 text-center">
              Press any key or click outside to close
            </p>
          </div>
        </div>
      )}

      {/* ── Speed indicator flash (when keyboard cycles speed) ── */}
      <div
        id="speed-flash"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 opacity-0 transition-opacity"
      >
        <div className="bg-black/70 text-white font-black text-2xl px-5 py-3 rounded-2xl">
          {speed}x
        </div>
      </div>
    </div>
  );
};
