// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`
                relative w-14 h-7 rounded-full border transition-all duration-300
                focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                ${
                  isDark
                    ? "bg-slate-800 border-slate-700 focus-visible:ring-slate-500"
                    : "bg-slate-200 border-slate-300 focus-visible:ring-slate-400"
                }
                ${className}
            `}
    >
      {/* Sliding pill */}
      <span
        className={`
                absolute top-0.75 w-5.5 h-5.5 rounded-full
                flex items-center justify-center shadow-md
                transition-all duration-300
                ${
                  isDark
                    ? "translate-x-7 bg-slate-950"
                    : "translate-x-0.75 bg-white"
                }
            `}
      >
        {isDark ? (
          <Moon size={12} className="text-blue-400" />
        ) : (
          <Sun size={13} className="text-amber-500" />
        )}
      </span>

      {/* Background icons */}
      <span
        className={`absolute left-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-40"}`}
      >
        <Moon size={10} className="text-slate-500" />
      </span>
      <span
        className={`absolute right-1.5 top-1/2 -translate-y-1/2 transition-opacity duration-200 ${isDark ? "opacity-40" : "opacity-0"}`}
      >
        <Sun size={10} className="text-slate-400" />
      </span>
    </button>
  );
}
