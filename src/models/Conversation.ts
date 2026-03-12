// src/models/Conversation.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage: string;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    lastMessage: { type: String, default: "" },
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);