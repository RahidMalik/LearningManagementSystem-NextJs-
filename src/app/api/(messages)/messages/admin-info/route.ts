// src/app/api/messages/admin-info/route.ts
import { NextRequest } from "next/server";
import { getAdminInfo } from "@/controllers/messageController";

export async function GET(req: NextRequest) {
    return getAdminInfo(req);
}