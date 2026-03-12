// src/controllers/messageController.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/configs/mongodb";
import validateRequest from "@/middleware/authMiddleware";
import { Message } from "@/models/Message";
import { Conversation } from "@/models/Conversation";
import { User } from "@/models/User";

interface AuthResult {
    success: boolean;
    user: { userId: string; email?: string; role?: string };
}

// ─────────────────────────────────────────────
// GET CONVERSATIONS
// Admin  → get all messages from from student.
// User   → only conservation with admin (auto create)
// ────────────────────────────────────────────────────
export async function getConversations(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (auth.user.role === "admin") {
            // ── Admin: All conversations ──
            const conversations = await Conversation.find({})
                .populate("participants", "name email photoURL role")
                .sort({ updatedAt: -1 })
                .lean();

            return NextResponse.json({ success: true, data: conversations });

        } else {
            // ── Student: only with admin ──
            const admin = await User.findOne({ role: "admin" }).lean() as any;
            if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

            // find or create
            let conv = await Conversation.findOne({
                participants: { $all: [auth.user.userId, admin._id] }
            }).populate("participants", "name email photoURL role").lean();

            if (!conv) {
                const newConv = await Conversation.create({
                    participants: [auth.user.userId, admin._id],
                    lastMessage: "",
                });
                conv = await Conversation.findById(newConv._id)
                    .populate("participants", "name email photoURL role")
                    .lean();
            }

            return NextResponse.json({ success: true, data: [conv] });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// GET MESSAGES — for a conversation
// ─────────────────────────────────────────────
export async function getMessages(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const convId = url.searchParams.get("convId");
        if (!convId) return NextResponse.json({ error: "convId required" }, { status: 400 });

        const conv = await Conversation.findById(convId).lean() as any;
        if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

        const isParticipant = conv.participants.some(
            (p: any) => p.toString() === auth.user.userId
        );
        const isAdmin = auth.user.role === "admin";

        if (!isParticipant && !isAdmin)
            return NextResponse.json({ error: "Access denied" }, { status: 403 });

        const messages = await Message.find({ conversationId: convId })
            .sort({ createdAt: 1 })
            .lean();

        return NextResponse.json({ success: true, data: messages });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// SEND MESSAGE
// POST /api/messages
// body: { receiverId, text, conversationId? }
// ─────────────────────────────────────────────
export async function sendMessage(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { receiverId, text, conversationId } = await request.json();

        if (!receiverId || !text)

            return NextResponse.json({ error: "receiverId and text required" }, { status: 400 });

        const senderId = auth.user.userId;

        // ── Non-admin can only message admin ──
        if (auth.user.role !== "admin") {

            const receiver = await User.findById(receiverId).lean() as any;

            if (!receiver || receiver.role !== "admin")

                return NextResponse.json({ error: "You can only message the admin" }, { status: 403 });
        }

        // ── Find or create conversation ──
        let conv;

        if (conversationId) {

            conv = await Conversation.findById(conversationId);
        }
        if (!conv) {

            conv = await Conversation.findOne({

                participants: { $all: [senderId, receiverId] },
            });
        }
        if (!conv) {
            conv = await Conversation.create({
                participants: [senderId, receiverId],
                lastMessage: text,
            });
        }

        // ── Create message ──
        const message = await Message.create({
            conversationId: conv._id,
            senderId,
            receiverId,
            text,
            seen: false,
        });

        // ── Update conversation ──
        await Conversation.findByIdAndUpdate(conv._id, {
            lastMessage: text,
            updatedAt: new Date(),
        });

        return NextResponse.json({ success: true, data: message });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// MARK MESSAGE AS SEEN
// PUT /api/messages/seen
// body: { messageId }
// ─────────────────────────────────────────────
export async function markAsSeen(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { messageId } = await request.json();
        if (!messageId) return NextResponse.json({ error: "messageId required" }, { status: 400 });

        await Message.findByIdAndUpdate(messageId, { seen: true });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// GET ADMIN INFO — for student (sidebar mein dikhane ke liye)
// GET /api/messages/admin-info
// ─────────────────────────────────────────────
export async function getAdminInfo(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const admin = await User.findOne({ role: "admin" })
            .select("name email photoURL role")
            .lean();

        if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

        return NextResponse.json({ success: true, data: admin });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}