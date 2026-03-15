// src/app/api/messages/route.ts

import { NextRequest } from "next/server";
import {
    getMessages,
    sendMessage,
    editMessage,
    deleteMessage
} from "@/controllers/messageController";

export async function GET(req: NextRequest) {
    return getMessages(req);
}

export async function POST(req: NextRequest) {
    return sendMessage(req);
}

export async function PUT(req: NextRequest) {
    return editMessage(req);
}

export async function DELETE(req: NextRequest) {
    return deleteMessage(req);
}