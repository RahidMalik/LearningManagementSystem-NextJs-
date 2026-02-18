"use client";

import { Bell, Check, Trash2, Info, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: "Course Updated",
      desc: "Graphic Design Masterclass has 2 new video lessons.",
      time: "Just now",
      type: "info",
      unread: true,
    },
    {
      id: 2,
      title: "Assignment Graded",
      desc: "Your assignment 'React Hooks' was marked as 'Excellent'.",
      time: "4 hours ago",
      type: "success",
      unread: true,
    },
    {
      id: 3,
      title: "Subscription Expiring",
      desc: "Your pro membership will expire in 3 days. Renew now!",
      time: "Yesterday",
      type: "warning",
      unread: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6 min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0a348f] flex items-center gap-2">
            <Bell className="text-amber-500" /> Notifications
          </h1>
          <p className="text-sm text-slate-500">
            Stay updated with your activities
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-xs font-bold text-[#0a348f] hover:bg-blue-50"
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
              notif.unread
                ? "bg-blue-50/50 border-blue-100 shadow-sm"
                : "bg-white border-slate-100"
            }`}
          >
            <div
              className={`mt-1 p-2 rounded-full shrink-0 ${
                notif.type === "success"
                  ? "bg-green-100 text-green-600"
                  : notif.type === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-[#0a348f]"
              }`}
            >
              {notif.type === "warning" ? (
                <AlertCircle size={20} />
              ) : (
                <Info size={20} />
              )}
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className={`font-bold text-sm ${notif.unread ? "text-slate-900" : "text-slate-700"}`}
                >
                  {notif.title}
                </h3>
                <span className="text-[10px] font-medium text-slate-400">
                  {notif.time}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {notif.desc}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
