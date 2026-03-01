import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course', required: true
    },
    amount: Number,
    paymentMethod: {
        type: String,
        enum: ['EasyPaisa', 'JazzCash'],
        required: true
    },
    senderPhone: String,
    // Receipt ki image ka URL (Cloudinary link)
    receiptUrl: {
        type: String,
        required: function () { return this.paymentMethod !== 'Stripe'; }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);