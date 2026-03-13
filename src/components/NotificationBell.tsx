"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNotifications } from "@/hook/useNotifications";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
  });
}

export default function NotificationBell() {
  const [userId, setUserId] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    api
      .getProfile()
      .then((res: any) => {
        const user = res?.data?.user ?? res?.user ?? res?.data;
        if (user?._id) setUserId(user._id);
      })
      .catch(() => {});
  }, []);

  const { notifications, unreadCount, markAllRead, loading } =
    useNotifications(userId);

  // Sirf latest 4 notifications nikaalein dropdown ke liye
  const latestNotifs = notifications.slice(0, 4);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* ── Bell Icon Button ── */}
      <DropdownMenuTrigger asChild>
        <button className="relative inline-flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors outline-none group">
          <Bell
            size={20}
            className="text-slate-600 dark:text-slate-400 group-hover:text-[#0a348f] dark:group-hover:text-blue-400 transition-colors"
          />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 shadow-sm pointer-events-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      {/* ── Dropdown Content ── */}
      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 rounded-2xl p-0 mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-[#0a348f] dark:text-blue-400 hover:underline flex items-center gap-1 transition-all"
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex flex-col max-h-80 overflow-y-auto custom-scrollbar">
          {loading && notifications.length === 0 ? (
            <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={20} className="animate-spin text-[#0a348f]" />
              <span className="text-xs font-medium">Loading...</span>
            </div>
          ) : latestNotifs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm font-medium">
              No new notifications
            </div>
          ) : (
            latestNotifs.map((notif) => (
              <div
                key={notif._id}
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications");
                }}
                className={`flex items-start gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  !notif.read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-bold truncate ${
                        !notif.read
                          ? "text-slate-900 dark:text-white"
                          : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {notif.title}
                    </p>
                    {/* 🔴 RED DOT FOR UNREAD */}
                    {!notif.read && (
                      <span className="w-0.5 h-0.5 rounded-full bg-red-500 shrink-0 mt-1 shadow-[0_0_5px_rgba(239,68,68,0.5)]"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">
                    {timeAgo(notif.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Link */}
        <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/notifications");
            }}
            className="w-full py-2.5 text-xs font-bold text-center text-slate-600 dark:text-slate-300 hover:text-[#0a348f] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            View All Notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
