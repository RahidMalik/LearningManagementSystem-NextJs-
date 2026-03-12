"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Info,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const typeConfig: Record<
  string,
  { icon: any; color: string; bg: string; border: string }
> = {
  enrollment: {
    icon: Check,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-100 dark:border-green-800/50",
  },
  payment_approved: {
    icon: Check,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-100 dark:border-green-800/50",
  },
  payment_rejected: {
    icon: AlertCircle,
    color: "text-red-500 dark:text-red-400",
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-100 dark:border-red-800/50",
  },
  payment_pending: {
    icon: Info,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-100 dark:border-amber-800/50",
  },
  new_payment: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-100 dark:border-blue-800/50",
  },
  new_student: {
    icon: Check,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-100 dark:border-purple-800/50",
  },
  course_update: {
    icon: Info,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-100 dark:border-blue-800/50",
  },
};

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
    day: "numeric",
    month: "short",
  });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = (await api.getNotifications()) as any;
      const data = res?.data ?? res;
      setNotifications(data?.data ?? []);
      setUnreadCount(data?.unreadCount ?? 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
    } catch {
      toast.error("Failed");
    } finally {
      setMarking(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a348f] dark:text-blue-400 flex items-center gap-2">
            <Bell className="text-amber-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="text-sm font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {notifications.length} total · {unreadCount} unread
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2 text-slate-400 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={marking}
              variant="ghost"
              className="text-xs font-bold text-[#0a348f] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1.5"
            >
              {marking ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCheck size={13} />
              )}
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2
            className="animate-spin text-[#0a348f] dark:text-blue-400"
            size={32}
          />
          <p className="text-sm text-slate-400 font-medium">
            Loading notifications...
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Bell size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
          <p className="font-bold text-slate-400 dark:text-slate-500">
            No notifications yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const cfg = typeConfig[notif.type] ?? typeConfig["course_update"];
            const Icon = cfg.icon;
            return (
              <div
                key={notif._id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  !notif.read
                    ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 shadow-sm"
                    : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
                }`}
              >
                {/* Icon */}
                <div className={`mt-0.5 p-2 rounded-full shrink-0 ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3
                      className={`font-bold text-sm ${!notif.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"}`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 shrink-0">
                      {timeAgo(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(notif._id)}
                  disabled={deletingId === notif._id}
                  className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0 mt-0.5"
                >
                  {deletingId === notif._id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
