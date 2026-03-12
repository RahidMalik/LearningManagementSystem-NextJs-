// src/controllers/notificationController.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/configs/mongodb";
import validateRequest from "@/middleware/authMiddleware";
import { Notification } from "@/models/Notification";

interface AuthResult {
    success: boolean;
    user: { userId: string; role?: string };
}

// ─────────────────────────────────────────────
// Helper — create notification (internal use)
// ─────────────────────────────────────────────
export async function createNotification({
    userId, type, title, message, meta = {}
}: {
    userId: string;
    type: INotification["type"];
    title: string;
    message: string;
    meta?: object;
}) {
    try {
        await Notification.create({ userId, type, title, message, meta });
    } catch (e) {
        console.error("Notification create failed:", e);
    }
}

// ─────────────────────────────────────────────
// GET notifications — logged in user ka
// GET /api/notifications
// ─────────────────────────────────────────────
export async function getNotifications(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const notifications = await Notification.find({ userId: auth.user.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        const unreadCount = await Notification.countDocuments({
            userId: auth.user.userId,
            read: false,
        });

        return NextResponse.json({ success: true, data: notifications, unreadCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// MARK ALL AS READ
// PUT /api/notifications/read
// ─────────────────────────────────────────────
export async function markAllRead(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await Notification.updateMany(
            { userId: auth.user.userId, read: false },
            { read: true }
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// DELETE one notification
// DELETE /api/notifications?id=xxx
// ─────────────────────────────────────────────
export async function deleteNotification(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        await Notification.findOneAndDelete({ _id: id, userId: auth.user.userId });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Fix type reference
import type { INotification } from "@/models/Notification";