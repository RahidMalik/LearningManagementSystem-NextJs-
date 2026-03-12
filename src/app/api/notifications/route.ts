// src/app/api/notifications/route.ts
import { NextRequest } from "next/server";
import { getNotifications, deleteNotification } from "@/controllers/notificationController";

export async function GET(req: NextRequest) {
    return getNotifications(req);
}

export async function DELETE(req: NextRequest) {
    return deleteNotification(req);
}