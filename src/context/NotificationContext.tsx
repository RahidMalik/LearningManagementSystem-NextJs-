"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export interface INotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  meta?: any;
}

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | undefined>();
  const fetchedRef = useRef(false);
  const esRef = useRef<EventSource | null>(null);

  // ── 1. Fetch User Data First ──
  useEffect(() => {
    api
      .getProfile()
      .then((res: any) => {
        const user = res?.data?.user ?? res?.user ?? res?.data;
        if (user?._id) setUserId(user._id);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // ── 2. Initial Fetch from DB ──
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.getNotifications()) as any;
      const payload = res?.data?.success !== undefined ? res.data : res;
      setNotifications(payload?.data ?? []);
      setUnreadCount(payload?.unreadCount ?? 0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchNotifications();
  }, [userId, fetchNotifications]);

  // ── 3. The Live SSE Connection ──
  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token") || "";

    if (esRef.current) return;

    const es = new EventSource(`/api/notifications/stream?token=${token}`);
    esRef.current = es;

    es.onmessage = (event) => {
      if (event.data.includes("keep-alive")) return;

      try {
        const notif: INotification = JSON.parse(event.data);

        setNotifications((prev) => {
          if (prev.some((n) => n._id === notif._id)) return prev;
          return [notif, ...prev];
        });

        setUnreadCount((c) => c + 1);

        // Toast Popup Trigger
        if (notif.type === "payment_approved") {
          toast.success(notif.title, { duration: 5000 });
        } else if (notif.type === "payment_rejected") {
          toast.error(notif.title, { duration: 5000 });
        } else {
          toast(notif.title, { icon: "🔔", duration: 4000 });
        }
      } catch (err) {
        console.error("❌ Error parsing SSE data:", err);
      }
    };

    es.onerror = (error) => {
      console.warn("⚠️ SSE disconnected, checking reconnect...");
    };

    return () => {
      console.log("🛑 Disconnecting SSE...");
      es.close();
      esRef.current = null;
    };
  }, [userId]); // Jab userId aayega sirf tabhi chalega

  // ── Mark all read ──
  const markAllRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed");
    }
  }, []);

  // ── Mark one read ──
  const markOneRead = useCallback(async (id: string) => {
    try {
      await api.markNotificationRead(id); // Ensure ye api function mojood ho
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      /* silent */
    }
  }, []);

  // ── Delete ──
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => {
        const removed = prev.find((n) => n._id === id);
        if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch {
      toast.error("Failed to delete");
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllRead,
        markOneRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return ctx;
}
