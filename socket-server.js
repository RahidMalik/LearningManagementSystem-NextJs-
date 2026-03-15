import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("🟢Connected:", socket.id);

    socket.on("userOnline", (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    socket.on("joinRoom", (conversationId) => {
        socket.join(conversationId);
    });

    socket.on("leaveRoom", (conversationId) => {
        socket.leave(conversationId)
    });

    socket.on("newMessage", (message) => {
        io.to(message.conversationId).emit("messageReceived", message);

        const receiverSocket = onlineUsers.get(message.receiverId);
        if (receiverSocket) {
            io.to(receiverSocket).emit("newNotification", {
                type: "message",
                from: message.senderId,
                text: message.text,
                conversationId: message.conversationId,
            })
        }
    });

    // 🚀 FIX: Added `conversationId` in emit payload for typing
    socket.on("typing", ({ conversationId, senderId }) => {
        socket.to(conversationId).emit("userTyping", { conversationId, senderId });
    });

    // 🚀 FIX: Added `conversationId` in emit payload for stopTyping
    socket.on("stopTyping", ({ conversationId, senderId }) => {
        socket.to(conversationId).emit("userStoppedTyping", { conversationId, senderId });
    });

    // 🚀 NEW: Mark message as Seen (Double Tick)
    socket.on("markSeen", ({ messageId, conversationId }) => {
        socket.to(conversationId).emit("messageSeenUpdate", { messageId });
    });

    // 🚀 NEW: Edit Message live update
    socket.on("messageEdited", ({ messageId, text, conversationId }) => {
        socket.to(conversationId).emit("messageEditedUpdate", { messageId, text });
    });

    // 🚀 NEW: Delete Message live update
    socket.on("messageDeleted", ({ messageId, conversationId }) => {
        socket.to(conversationId).emit("messageDeletedUpdate", { messageId });
    });

    socket.on("disconnect", () => {
        onlineUsers.forEach((sid, uid) => {
            if (sid === socket.id) onlineUsers.delete(uid)
        });
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log("🔴Disconnected", socket.id)
    });
});

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`⚡ Socket server: http://localhost:${PORT}`);
});