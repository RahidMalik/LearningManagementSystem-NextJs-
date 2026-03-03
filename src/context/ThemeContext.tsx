// src/context/ThemeContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// ============================================================
// Types
// ============================================================
type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// ============================================================
// Context
// ============================================================
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ============================================================
// Provider
// ============================================================
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  //  On mount — localStorage ya system preference se theme lo
  useEffect(() => {
    const saved = localStorage.getItem("lms-theme") as Theme | null;
    if (saved === "dark" || saved === "light") {
      setThemeState(saved);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setThemeState(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  //  Theme change hone par <html> class update karo
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("lms-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () =>
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  const setTheme = (t: Theme) => setThemeState(t);

  //  Flash rokne ke liye mount se pehle null return
  if (!mounted) return null;

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, isDark: theme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// Hook
// ============================================================
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return context;
}
