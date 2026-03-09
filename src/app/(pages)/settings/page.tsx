"use client";

import {
  User,
  FileText,
  HelpCircle,
  UserPlus,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  LogIn,
  Loader2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function SettingsPage() {
  const { isDark } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }
        const res = await api.getProfile();
        if (res?.success) {
          setUser(res.user);
          setIsLoggedIn(true);
        } else setIsLoggedIn(false);
      } catch {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const settingsOptions = [
    {
      icon: User,
      label: "Edit Profile",
      href: "/profile",
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      icon: FileText,
      label: "Terms & Conditions",
      href: "/terms",
      accent: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: HelpCircle,
      label: "Help Center",
      href: "/help",
      accent: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
    {
      icon: UserPlus,
      label: "Invite Friends",
      href: "/invite",
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="min-h-screen flex justify-center px-4 py-10 transition-colors duration-300">
      {/* Subtle radial behind card */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30 dark:opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(10,52,143,0.10) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* ── Header ── */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0a348f] dark:text-blue-400 mb-1">
              Account
            </p>
            <h1 className="text-3xl font-black text-foreground">Settings</h1>
          </div>
          <Sparkles
            size={18}
            className="text-[#0a348f]/30 dark:text-blue-500/40 mb-1"
          />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0a348f]/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#0a348f]" />
            </div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
              Loading…
            </p>
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-3">
            {/* ── Profile card ── */}
            <div className="relative rounded-3xl overflow-hidden border border-border p-5 mb-2">
              {/* Blue strip top */}
              <div className="absolute top-0 left-0 right-0 h-0.75 bg-linear-to-r from-[#0a348f] via-blue-400 to-transparent" />

              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <Avatar className="h-16 w-16 border-2 border-[#0a348f]/20 shadow-lg">
                    <AvatarImage
                      src={user?.photoURL}
                      alt={user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#0a348f] text-white text-xl font-black">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online dot */}
                  <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-foreground truncate leading-tight">
                    {user?.name || "User Name"}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {user?.email || "email@example.com"}
                  </p>
                  <span className="inline-flex items-center mt-2 text-[9px] font-black uppercase tracking-widest text-[#0a348f] dark:text-blue-400 bg-[#0a348f]/8 dark:bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Student
                  </span>
                </div>
              </div>
            </div>

            {/* ── Menu items ── */}
            <div className="rounded-3xl border border-border overflow-hidden divide-y divide-border">
              {settingsOptions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center justify-between px-5 py-4 group hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.accent}`}
                      >
                        <Icon size={17} />
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-muted-foreground group-hover:text-[#0a348f] dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
                    />
                  </Link>
                );
              })}
            </div>

            {/* ── Dark mode toggle ── */}
            <div className="rounded-3xl border border-dashed border-border px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-500"}`}
                >
                  {isDark ? <Moon size={17} /> : <Sun size={17} />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">
                    Dark Mode
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isDark ? "Currently on" : "Currently off"}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            {/* ── Logout ── */}
            <button
              onClick={handleLogout}
              className="w-full rounded-3xl border border-transparent hover:border-red-200 dark:hover:border-red-900/40 px-5 py-4 flex items-center justify-between group hover:bg-red-50/60 dark:hover:bg-red-950/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 shrink-0">
                  <LogOut size={17} />
                </div>
                <span className="font-bold text-sm text-red-500">Logout</span>
              </div>
              <ChevronRight
                size={15}
                className="text-red-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all"
              />
            </button>
          </div>
        ) : (
          /* ── Not logged in ── */
          <div className="rounded-3xl border border-border p-10 flex flex-col items-center text-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
                <User size={36} className="text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0a348f] rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-black">?</span>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-black text-foreground mb-2">
                Not logged in
              </h2>
              <p className="text-sm text-muted-foreground max-w-55 leading-relaxed">
                Log in to access your profile and settings.
              </p>
            </div>

            <Link href="/login" className="w-full">
              <button className="w-full flex items-center justify-center gap-2 bg-[#0a348f] text-white h-12 rounded-2xl font-black text-sm hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                <LogIn size={17} /> Login Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
