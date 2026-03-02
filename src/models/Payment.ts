// src/models/Payment.ts
import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["EasyPaisa", "JazzCash", "stripe"], required: true },
    senderPhone: { type: String },
    receiptUrl: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);