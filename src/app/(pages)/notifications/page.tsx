"use client";

import { Bell, Check, Trash2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Purchase Successful 🎉",
      desc: "You have successfully enrolled in 'MERN Stack Development'. Start learning now!",
      time: "5 mins ago",
      type: "success",
      unread: true,
    },
    {
      id: 2,
      title: "New Lesson Unlocked 📚",
      desc: "Instructor Malik Rahid added 'React Custom Hooks' in your enrolled course.",
      time: "2 hours ago",
      type: "info",
      unread: true,
    },
    {
      id: 3,
      title: "Assignment Deadline Alert ⏰",
      desc: "Your assignment 'Build a Portfolio App' is due in 24 hours. Submit it soon!",
      time: "5 hours ago",
      type: "warning",
      unread: true,
    },
    {
      id: 4,
      title: "Certificate Earned 🎓",
      desc: "Congratulations! You have completed 'Flutter App Development'. Download your certificate now.",
      time: "Yesterday",
      type: "success",
      unread: false,
    },
    {
      id: 5,
      title: "System Maintenance 🛠️",
      desc: "CYBEX learning portal will be under scheduled maintenance on Sunday from 2 AM to 4 AM.",
      time: "2 days ago",
      type: "info",
      unread: false,
    },
  ];

  return (
    // Main Container with Dark Mode support
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 min-h-[calc(100vh-4rem)] bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 transition-colors">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a348f] dark:text-blue-400 flex items-center gap-2 transition-colors">
            <Bell className="text-amber-500" /> Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">
            Stay updated with your activities
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-xs font-bold text-[#0a348f] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
        >
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
              notif.unread
                ? "bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50 shadow-sm"
                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700"
            }`}
          >
            {/* Icon Wrapper */}
            <div
              className={`mt-1 p-2 rounded-full shrink-0 transition-colors ${
                notif.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : notif.type === "warning"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-blue-100 dark:bg-blue-900/30 text-[#0a348f] dark:text-blue-400"
              }`}
            >
              {notif.type === "warning" ? (
                <AlertCircle size={20} />
              ) : notif.type === "success" ? (
                <Check size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className={`font-bold text-sm transition-colors ${
                    notif.unread
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {notif.title}
                </h3>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">
                  {notif.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed transition-colors">
                {notif.desc}
              </p>
            </div>

            {/* Actions (Delete) */}
            <div className="flex flex-col gap-2">
              <button className="text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
