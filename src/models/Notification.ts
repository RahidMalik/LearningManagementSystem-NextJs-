// src/models/Notification.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: "enrollment" | "payment_approved" | "payment_rejected" | "payment_pending" | "new_student" | "new_payment" | "course_update";
    title: string;
    message: string;
    read: boolean;
    meta?: {
        courseId?: string;
        paymentId?: string;
        studentId?: string;
    };
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Notification = mongoose.models.Notification ||
    mongoose.model<INotification>("Notification", NotificationSchema);