// src/controllers/paymentController.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { Payment } from "@/models/Payment";
import cloudinary from "@/configs/cloudinary";
import {
    sendPaymentApprovedEmail,
    sendPaymentRejectedEmail,
    sendPaymentPendingEmail,
    sendAdminSlipEmail,
} from "@/lib/emailService";
import { User } from "@/models/User";
import { createNotification } from "@/controllers/notificationController";

interface AuthResult {
    success: boolean;
    error?: string;
    user: { userId: string; email?: string; role?: string };
}

// ─────────────────────────────────────────────
// CREATE PAYMENT INTENT
// ─────────────────────────────────────────────
export async function PaymentIntentCreate(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });

        const { courseId, accessType = "full" } = await request.json();
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const existing = await Enrollment.findOne({ user: auth.user.userId, course: courseId });
        if (existing) {
            if (existing.accessType === "half" && accessType === "full") {
                // upgrade allowed
            } else {
                return NextResponse.json({ success: false, error: "Already enrolled", alreadyEnrolled: true }, { status: 400 });
            }
        }

        const course = await Course.findById(courseId);
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

        const discount = course.discount || 0;
        const fullPrice = Math.round(course.price - (course.price * discount) / 100);
        let chargeAmount = fullPrice;
        if (existing?.accessType === "half" && accessType === "full") chargeAmount = Math.round(fullPrice / 2);
        else if (accessType === "half") chargeAmount = Math.round(fullPrice / 2);

        const intent = await stripe.paymentIntents.create({
            amount: chargeAmount * 100, currency: "pkr",
            metadata: { courseId, userId: auth.user.userId, courseName: course.title, accessType },
        });

        return NextResponse.json({
            success: true, clientSecret: intent.client_secret,
            amount: chargeAmount, fullAmount: fullPrice, accessType,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// CHECK ENROLLMENT
// ─────────────────────────────────────────────
export async function CheckEnrollment(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;

        if (!auth.success) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const courseId = new URL(request.url).searchParams.get("courseId");

        if (!courseId) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const enrollment = await Enrollment.findOne({
            user: auth.user.userId, course:
                courseId
        });
        if (!enrollment) return NextResponse.json({
            isEnrolled: false, accessType: null,
            paymentMethod: null
        });

        const walletPayment = await Payment.findOne({
            user: auth.user.userId, course:
                courseId
        });
        return NextResponse.json({
            isEnrolled: true,
            accessType: enrollment.accessType ?? null,
            paymentMethod: walletPayment ? "wallet" : "card",
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// WALLET VERIFICATION
// ─────────────────────────────────────────────
export async function WalletVerification(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const { courseId, method, phone, amount, receiptUrl, accessType = "full" } = await request.json();

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        if (!receiptUrl)
            return NextResponse.json({ error: "Receipt image required" }, { status: 400 });

        const course = await Course.findById(courseId);
        if (!course)
            return NextResponse.json({ error: "Course not found" }, { status: 404 });

        // ── Payment DB mein save ──
        const payment = await Payment.create({
            user: auth.user.userId,
            course: courseId,
            amount,
            paymentMethod: method,
            senderPhone: phone,
            receiptUrl,
            status: "pending",
            accessType,
        });

        // ── Student + course details fetch ──
        const [studentDoc, adminDoc] = await Promise.all([
            User.findById(auth.user.userId).select("name email").lean() as any,
            User.findOne({ role: "admin" }).select("_id").lean() as any,
        ]);

        const studentName = studentDoc?.name || "Student";
        const studentEmail = studentDoc?.email || "";
        const courseTitle = course.title;
        const accessText = accessType === "half" ? "50% Half Access" : "Full Access";
        const methodUpper = method?.toUpperCase() || "WALLET";

        // ── Student pending email ──
        try {
            if (studentEmail) {
                await sendPaymentPendingEmail({
                    toEmail: studentEmail,
                    userName: studentName,
                    courseName: courseTitle,
                    amount: Number(amount),
                    method,
                });
            }
        } catch (e) { console.error("Student pending email failed:", e); }

        // ── Student notification ──
        await createNotification({
            userId: auth.user.userId,
            type: "payment_pending",
            title: "⏳ Payment Under Review",
            message: `Your PKR ${amount} payment via ${methodUpper} for "${courseTitle}" (${accessText}) received. We'll verify within 24hrs.`,
            meta: { paymentId: payment._id.toString(), courseId },
        });

        // ── Admin slip email ──
        try {
            await sendAdminSlipEmail({
                studentName: studentName,
                studentEmail: studentEmail,
                courseName: courseTitle,
                amount: Number(amount),
                method,
                accessType,
                receiptUrl: receiptUrl,
            });
        } catch (e) { console.error("Admin slip email failed:", e); }

        // ── Admin notification ──
        if (adminDoc) {
            await createNotification({
                userId: adminDoc._id.toString(),
                type: "new_payment",
                title: `💰 New Payment — ${methodUpper}`,
                message: `${studentName} (${studentEmail}) paid PKR ${amount} via ${methodUpper} for "${courseTitle}". Requesting: ${accessText}. Please verify slip.`,
                meta: { paymentId: payment._id.toString(), courseId, studentId: auth.user.userId },
            });
        }

        return NextResponse.json({
            success: true,
            message: "Receipt submitted. Admin will verify and enroll you shortly.",
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// ADMIN REVENUE
// ─────────────────────────────────────────────
export const getAdminRevenue = async (req: Request) => {
    try {
        await dbConnect();
        const auth = await validateRequest(req);
        if (!auth.success || !auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const walletPayments = await Payment.find({ status: "approved" });
        const walletRevenue = walletPayments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0);
        const walletPairs = walletPayments.map((p: any) => `${p.user}_${p.course}`);
        const allEnrollments = await Enrollment.find({}).populate("course", "price");
        const stripeEnrollments = allEnrollments.filter((e: any) => !walletPairs.includes(`${e.user}_${e.course}`));
        const stripeRevenue = stripeEnrollments.reduce((s: number, e: any) => {
            const price = Number(e.course?.price) || 0;
            return s + (e.accessType === "half" ? Math.round(price / 2) : price);
        }, 0);

        return NextResponse.json({
            success: true, totalRevenue: walletRevenue + stripeRevenue,
            breakdown: { wallet: walletRevenue, stripe: stripeRevenue, walletCount: walletPayments.length, stripeCount: stripeEnrollments.length },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

export const getCoursesState = async (req: Request) => {
    try {
        await dbConnect();
        const auth = await validateRequest(req);
        if (!auth.success || !auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const enrollments = await Enrollment.find({}).populate("course", "price title");
        const walletPayments = await Payment.find({ status: "approved" }).lean();
        const walletPairs = walletPayments.map((p: any) => `${p.user}_${p.course}`);
        const stateMap: Record<string, { students: number; revenue: number }> = {};

        enrollments.forEach((e: any) => {
            const cid = e.course?._id?.toString(); if (!cid) return;
            if (!stateMap[cid]) stateMap[cid] = { students: 0, revenue: 0 };
            stateMap[cid].students++;
            if (!walletPairs.includes(`${e.user}_${cid}`)) {
                const price = Number(e.course?.price) || 0;
                stateMap[cid].revenue += e.accessType === "half" ? Math.round(price / 2) : price;
            }
        });
        walletPayments.forEach((p: any) => {
            const cid = p.course?.toString(); if (!cid) return;
            if (!stateMap[cid]) stateMap[cid] = { students: 0, revenue: 0 };
            stateMap[cid].revenue += Number(p.amount) || 0;
        });

        return NextResponse.json({ success: true, stats: stateMap });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ─────────────────────────────────────────────
// GET ALL WALLET PAYMENTS
// ─────────────────────────────────────────────
export async function GetAdminWalletPayments(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payments = await Payment.find({})
            .populate("user", "name email")
            .populate("course", "title price")
            .sort({ createdAt: -1 }).lean();

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// APPROVE WALLET PAYMENT
// ─────────────────────────────────────────────
export async function ApproveWalletPayment(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();
        const payment = await Payment.findById(paymentId)
            .populate("user", "name email").populate("course", "title");
        if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const accessType = (payment as any).accessType || "full";
        const userObj: any = payment.user;
        const courseObj: any = payment.course;

        payment.status = "approved";
        await payment.save();

        await Enrollment.findOneAndUpdate(
            { user: userObj._id, course: courseObj._id },
            { accessType, status: "active", progress: 0 },
            { upsert: true, new: true }
        );

        try {
            if (userObj?.email) await sendPaymentApprovedEmail({
                toEmail: userObj.email, userName: userObj.name || "Student",
                courseName: courseObj.title, amount: (payment as any).amount,
                accessType: accessType as "half" | "full",
            });
        } catch (e) { console.error("Email failed:", e); }

        // ✅ Student
        await createNotification({
            userId: userObj._id.toString(), type: "payment_approved",
            title: "✅ Payment Approved!",
            message: `Your payment for "${courseObj.title}" approved. You can access ${accessType === "half" ? "first 50% videos" : "all videos"} now. 🎉`,
            meta: { paymentId, courseId: courseObj._id.toString() },
        });

        return NextResponse.json({ success: true, message: "Approved!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// REJECT WALLET PAYMENT
// ─────────────────────────────────────────────
export async function RejectWalletPayment(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();
        const payment = await Payment.findByIdAndUpdate(paymentId, { status: "rejected" }, { new: true })
            .populate("user", "name email").populate("course", "title");
        if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const userObj: any = payment.user;
        const courseObj: any = payment.course;

        try {
            if (userObj?.email) await sendPaymentRejectedEmail({
                toEmail: userObj.email, userName: userObj.name || "Student",
                courseName: courseObj.title, amount: (payment as any).amount,
            });
        } catch (e) { console.error("Email failed:", e); }

        // ✅ Student
        await createNotification({
            userId: userObj._id.toString(), type: "payment_rejected",
            title: "❌ Payment Rejected",
            message: `Your payment for "${courseObj.title}" was rejected. Please re-upload a clear screenshot.`,
            meta: { paymentId, courseId: courseObj._id.toString() },
        });

        return NextResponse.json({ success: true, message: "Rejected!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}