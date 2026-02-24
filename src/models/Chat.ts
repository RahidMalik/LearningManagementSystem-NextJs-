import mongoose, { Document, Types, Schema } from 'mongoose';

export interface IMessage extends Document {
    conversationId: Types.ObjectId;
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    text: string;
    seen: boolean;
    createdAt: Date;
}

// 2. Interface for Conversation
export interface IConversation extends Document {
    participants: Types.ObjectId[];
    lastMessage: string;
    updatedAt: Date;
}
// --- Conversation Schema between two users ---
const conversationSchema = new Schema<IConversation>({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    lastMessage: {
        type: String,
        default: ""
    }
}, { timestamps: true });
// --- Message Schema ---
const messageSchema = new Schema<IMessage>({
    conversationId: {
        type: Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    seen: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", conversationSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);