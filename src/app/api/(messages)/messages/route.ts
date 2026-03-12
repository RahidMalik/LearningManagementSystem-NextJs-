// src/app/api/messages/route.ts

import { NextRequest } from "next/server";
import { getMessages, sendMessage } from "@/controllers/messageController";

export async function GET(req: NextRequest) {
    return getMessages(req);
}

export async function POST(req: NextRequest) {
    return sendMessage(req);
}