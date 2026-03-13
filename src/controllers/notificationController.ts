// src/controllers/notificationController.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/configs/mongodb";
import validateRequest from "@/middleware/authMiddleware";
import { Notification, INotification } from "@/models/Notification";
import { pushNotificationToUser } from "@/app/api/notifications/stream/route";

interface AuthResult {
    success: boolean;
    user: { userId: string; role?: string };
}

function uidQuery(uid: string) {
    if (!mongoose.Types.ObjectId.isValid(uid)) return uid;
    const oid = new mongoose.Types.ObjectId(uid);
    return { $in: [oid, uid] };
}

// ─────────────────────────────────────────────
// INTERNAL HELPER — paymentController use karta hai
// DB mein save + SSE se live push
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
        await dbConnect();
        const uid = mongoose.Types.ObjectId.isValid(userId)
            ? new mongoose.Types.ObjectId(userId)
            : userId;

        // 1. DB mein save
        const saved = await Notification.create({
            userId: uid, type, title, message, meta, read: false
        });
        console.log(`✅ Notification saved | ${userId} | ${type}`);

        // 2. Live push via SSE
        pushNotificationToUser(userId, {
            _id: saved._id.toString(),
            type, title, message,
            read: false,
            createdAt: saved.createdAt,
            meta,
        });
    } catch (e: any) {
        console.error("❌ createNotification failed:", e.message);
    }
}

// ─────────────────────────────────────────────
// GET /api/notifications
// ─────────────────────────────────────────────
export async function getNotifications(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const query = uidQuery(auth.user.userId);

        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ userId: query }).sort({ createdAt: -1 }).limit(50).lean(),
            Notification.countDocuments({ userId: query, read: false }),
        ]);

        return NextResponse.json({ success: true, data: notifications, unreadCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// PUT /api/notifications/read
// ─────────────────────────────────────────────
export async function markAllRead(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await Notification.updateMany(
            { userId: uidQuery(auth.user.userId), read: false },
            { read: true }
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// DELETE /api/notifications?id=xxx
// ─────────────────────────────────────────────
export async function deleteNotification(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const id = new URL(request.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

        await Notification.findOneAndDelete({
            _id: id,
            userId: uidQuery(auth.user.userId)
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}