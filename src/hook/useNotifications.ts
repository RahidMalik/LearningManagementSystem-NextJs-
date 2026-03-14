// src/hook/useNotifications.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);
    const esRef = useRef<EventSource | null>(null);

    // ── DB se fetch ──
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.getNotifications() as any;
            setNotifications(res?.data ?? []);
            setUnreadCount(res?.unreadCount ?? 0);
        } catch { /* silent */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchNotifications();
    }, [fetchNotifications]);

    // ── SSE — live notifications ──
    useEffect(() => {
        if (!userId) return;
        if (esRef.current) return;

        const es = new EventSource("/api/notifications/stream");
        esRef.current = es;

        es.onmessage = (event) => {
            try {
                const notif: INotification = JSON.parse(event.data);
                setNotifications((prev) => {
                    if (prev.some((n) => n._id === notif._id)) return prev;
                    return [notif, ...prev];
                });
                setUnreadCount((c) => c + 1);

                if (notif.type === "payment_approved") {
                    toast.success(notif.title, { duration: 5000 });
                } else if (notif.type === "payment_rejected") {
                    toast.error(notif.title, { duration: 5000 });
                } else {
                    toast(notif.title, { icon: "🔔", duration: 4000 });
                }
            } catch { /* ignore */ }
        };

        es.onerror = () => console.warn("SSE reconnecting...");

        return () => {
            es.close();
            esRef.current = null;
        };
    }, [userId]);

    // ── Mark ALL read ──
    const markAllRead = useCallback(async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch { toast.error("Failed"); }
    }, []);

    // ── Mark ONE read (click pe) ──
    const markOneRead = useCallback(async (id: string) => {
        try {
            await api.markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => n._id === id ? { ...n, read: true } : n)
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch { /* silent */ }
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
        } catch { toast.error("Failed to delete"); }
    }, []);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAllRead,
        markOneRead,
        deleteNotification,
    };
}