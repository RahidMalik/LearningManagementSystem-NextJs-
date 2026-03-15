"use client";

import { Home, LayoutGrid, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
  const pathname = usePathname();

  // Function to check if the current path is exactly active
  const isActive = (path: string) => pathname === path;

  // Function to check if we are inside a section (e.g. /course/123)
  const isSectionActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-18 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-6 md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe transition-colors duration-300">
      {/* Home - Dashboard */}
      <Link href="/" className="flex flex-col items-center py-2 transition-all">
        <div
          className={`p-2.5 rounded-xl ${
            isActive("/")
              ? "bg-[#0a348f] text-white shadow-md shadow-blue-900/20"
              : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Home size={20} fill={isActive("/") ? "currentColor" : "none"} />
        </div>
      </Link>

      {/* Courses/Categories */}
      <Link
        href="/course"
        className="flex flex-col items-center py-2 transition-all"
      >
        <div
          className={`p-2.5 rounded-xl ${
            // 🚀 FIX: "/courses" ki jagah "/course" kar diya aur startsWith use kiya
            isSectionActive("/course")
              ? "bg-[#0a348f] text-white shadow-md shadow-blue-900/20"
              : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <LayoutGrid
            size={20}
            fill={isSectionActive("/course") ? "currentColor" : "none"}
          />
        </div>
      </Link>

      {/* Messages */}
      <Link
        href="/messages"
        className="flex flex-col items-center py-2 transition-all"
      >
        <div
          className={`p-2.5 rounded-xl ${
            isSectionActive("/messages")
              ? "bg-[#0a348f] text-white shadow-md shadow-blue-900/20"
              : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <MessageSquare
            size={20}
            fill={isSectionActive("/messages") ? "currentColor" : "none"}
          />
        </div>
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        className="flex flex-col items-center py-2 transition-all"
      >
        <div
          className={`p-2.5 rounded-xl ${
            isSectionActive("/profile")
              ? "bg-[#0a348f] text-white shadow-md shadow-blue-900/20"
              : "text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <User
            size={20}
            fill={isSectionActive("/profile") ? "currentColor" : "none"}
          />
        </div>
      </Link>
    </nav>
  );
};
