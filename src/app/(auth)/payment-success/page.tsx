"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentSuccess() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<
    { x: number; y: number; delay: number; size: number }[]
  >([]);

  useEffect(() => {
    setShow(true);
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.2,
        size: Math.random() * 6 + 3,
      })),
    );
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center overflow-hidden relative">
      {/* ── Background: subtle radial burst ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 40%,
              rgba(10,52,143,0.07) 0%,
              transparent 70%
            )
          `,
        }}
      />

      {/* ── Floating confetti particles ── */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full opacity-0"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              i % 3 === 0 ? "#0a348f" : i % 3 === 1 ? "#3b82f6" : "#93c5fd",
            animation: show
              ? `floatUp 2.4s ease-out ${p.delay}s forwards`
              : "none",
          }}
        />
      ))}

      {/* ── Decorative arc lines ── */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {[200, 320, 440, 560].map((r, i) => (
          <circle
            key={i}
            cx="50%"
            cy="44%"
            r={r}
            fill="none"
            stroke="#0a348f"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* ── Card ── */}
      <div
        className="relative z-10 w-full max-w-xs sm:max-w-sm mx-auto px-6"
        style={{
          opacity: show ? 1 : 0,
          transform: show
            ? "translateY(0) scale(1)"
            : "translateY(24px) scale(0.96)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* Checkmark ring */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "rgba(10,52,143,0.12)",
                transform: show ? "scale(1.55)" : "scale(1)",
                transition: "transform 1s ease 0.3s",
              }}
            />
            {/* Middle ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-[#0a348f]/20"
              style={{
                transform: show ? "scale(1.28)" : "scale(1)",
                transition: "transform 0.8s ease 0.2s",
              }}
            />
            {/* Core circle */}
            <div
              className="relative w-24 h-24 rounded-full bg-[#0a348f] flex items-center justify-center shadow-xl"
              style={{
                boxShadow:
                  "0 20px 60px rgba(10,52,143,0.35), 0 4px 16px rgba(10,52,143,0.2)",
              }}
            >
              <svg
                className="w-11 h-11 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 40,
                  strokeDashoffset: show ? 0 : 40,
                  transition:
                    "stroke-dashoffset 0.55s cubic-bezier(0.4,0,0.2,1) 0.45s",
                }}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Text */}
        <div
          className="text-center space-y-3 mb-10"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
          }}
        >
          {/* Overline label */}
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0a348f] dark:text-blue-400">
            Transaction Complete
          </p>

          <h2 className="text-[2rem] font-black leading-tight tracking-tight text-foreground">
            You&rsquo;re all
            <br />
            <span className="text-[#0a348f] dark:text-blue-400">set!</span>
          </h2>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-60 mx-auto">
            Your course is unlocked and ready. Jump in whenever you are.
          </p>
        </div>

        {/* Receipt-style divider */}
        <div
          className="flex items-center gap-3 mb-8"
          style={{
            opacity: show ? 1 : 0,
            transition: "opacity 0.4s ease 0.7s",
          }}
        >
          <div className="flex-1 border-t border-dashed border-border" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="flex-1 border-t border-dashed border-border" />
        </div>

        {/* Button */}
        <div
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease 0.8s, transform 0.4s ease 0.8s",
          }}
        >
          <Button
            onClick={() => router.push("/course")}
            className="w-full h-13 rounded-2xl font-black text-sm tracking-wide bg-[#0a348f] hover:bg-blue-800 text-white transition-all active:scale-95 border-0"
            style={{
              boxShadow:
                "0 8px 32px rgba(10,52,143,0.25), 0 2px 8px rgba(10,52,143,0.15)",
            }}
          >
            START LEARNING →
          </Button>

          <p className="text-center text-[10px] text-muted-foreground mt-4 font-medium">
            Check your email for enrollment confirmation
          </p>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes floatUp {
          0%   { opacity: 0; transform: translateY(0) scale(0.5); }
          20%  { opacity: 0.9; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.2) rotate(45deg); }
        }
      `}</style>
    </div>
  );
}
