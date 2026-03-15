// src/app/api/messages/seen/route.ts

import { NextRequest } from "next/server";
import { markAsSeen } from "@/controllers/messageController";

export async function PUT(req: NextRequest) {
    return markAsSeen(req);
}