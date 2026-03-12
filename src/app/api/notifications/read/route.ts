// src/app/api/notifications/read/route.ts
import { NextRequest } from "next/server";
import { markAllRead } from "@/controllers/notificationController";

export async function PUT(req: NextRequest) {
    return markAllRead(req);
}