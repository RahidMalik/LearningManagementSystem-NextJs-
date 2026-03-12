// src/models/Message.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    text: string;
    seen: boolean;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    seen: { type: Boolean, default: false },
}, { timestamps: true });

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);