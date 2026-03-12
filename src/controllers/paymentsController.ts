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
    sendPaymentPendingEmail
} from "@/lib/emailService";
import { createNotification } from "@/controllers/notificationController";
import { User } from "@/models/User";

interface AuthResult {
    success: boolean;
    error?: string;
    user: { userId: string; email?: string; role?: string; };
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

        const existingEnrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });

        if (existingEnrollment) {
            if (existingEnrollment.accessType === "half" && accessType === "full") {
                // upgrade allowed
            } else {
                return NextResponse.json({ success: false, error: "You are already enrolled in this course.", alreadyEnrolled: true }, { status: 400 });
            }
        }

        const course = await Course.findById(courseId);
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

        const discount = course.discount || 0;
        const fullPrice = Math.round(course.price - (course.price * discount) / 100);

        let chargeAmount: number;
        if (existingEnrollment?.accessType === "half" && accessType === "full") {
            chargeAmount = Math.round(fullPrice / 2);
        } else if (accessType === "half") {
            chargeAmount = Math.round(fullPrice / 2);
        } else {
            chargeAmount = fullPrice;
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: chargeAmount * 100,
            currency: "pkr",
            metadata: { courseId, userId: auth.user.userId, courseName: course.title, accessType },
        });

        return NextResponse.json({
            success: true, clientSecret: paymentIntent.client_secret,
            amount: chargeAmount, fullAmount: fullPrice, accessType,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// ENROLL IN COURSE (Stripe)
// ─────────────────────────────────────────────
export async function EnrollInCourse(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });

        const { courseId, accessType = "full" } = await request.json();
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const existingEnrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });

        if (existingEnrollment) {
            if (existingEnrollment.accessType === "half" && accessType === "full") {
                existingEnrollment.accessType = "full";
                await existingEnrollment.save();
                return NextResponse.json({ success: true, upgraded: true, accessType: "full", message: "Access upgraded to full!" });
            }
            return NextResponse.json({ success: false, error: "Already enrolled" }, { status: 400 });
        }

        const enrollment = await Enrollment.create({
            user: auth.user.userId, course: courseId,
            accessType, status: "active", progress: 0,
        });

        // ── Notifications (Stripe enrollment) ──
        try {
            const course = await Course.findById(courseId).select("title").lean() as any;
            if (course) {
                // Student
                await createNotification({
                    userId: auth.user.userId,
                    type: "enrollment",
                    title: "🎉 Enrollment Successful!",
                    message: `You are now enrolled in "${course.title}". ${accessType === "half" ? "First 50% content unlocked." : "All content unlocked. Happy learning!"}`,
                    meta: { courseId },
                });
                // Admin
                const admin = await User.findOne({ role: "admin" }).lean() as any;
                if (admin) {
                    await createNotification({
                        userId: admin._id.toString(),
                        type: "new_student",
                        title: "🎓 New Enrollment",
                        message: `A student just enrolled in "${course.title}" via card payment.`,
                        meta: { courseId },
                    });
                }
            }
        } catch (notifErr) { console.error("Enrollment notification failed:", notifErr); }

        return NextResponse.json({ success: true, enrollment, accessType });
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

        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        if (!courseId) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const enrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });
        if (!enrollment) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const walletPayment = await Payment.findOne({ user: auth.user.userId, course: courseId });
        const paymentMethod = walletPayment ? "wallet" : "card";

        return NextResponse.json({ isEnrolled: true, accessType: enrollment.accessType ?? null, paymentMethod });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// WALLET VERIFICATION
// ─────────────────────────────────────────────
export async function WalletVerification(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { courseId, method, phone, amount, userId, image } = body;

        if (!image) return NextResponse.json({ success: false, message: "Payment screenshot is required." }, { status: 400 });

        const uploadResponse = await cloudinary.uploader.upload(image, { folder: "lms_slips" });
        const receiptUrl = uploadResponse.secure_url;

        const payment = await Payment.create({
            user: userId, course: courseId, amount,
            paymentMethod: method, senderPhone: phone,
            receiptUrl, status: "pending",
        });

        // ── Email + Notifications ──
        try {
            const userDoc = await User.findById(userId).select("name email").lean() as any;
            const courseDoc = await Course.findById(courseId).select("title").lean() as any;

            // Email
            if (userDoc?.email && courseDoc?.title) {
                await sendPaymentPendingEmail({
                    toEmail: userDoc.email,
                    userName: userDoc.name || "Student",
                    courseName: courseDoc.title,
                    amount: Number(amount),
                    method,
                });
            }

            // Student notification
            await createNotification({
                userId: userId,
                type: "payment_pending",
                title: "⏳ Payment Under Review",
                message: `Your payment slip for "${courseDoc?.title}" has been received. We'll verify it within 24 hours.`,
                meta: { paymentId: payment._id.toString(), courseId },
            });

            // Admin notification
            const adminUser = await User.findOne({ role: "admin" }).lean() as any;
            if (adminUser) {
                await createNotification({
                    userId: adminUser._id.toString(),
                    type: "new_payment",
                    title: "💰 New Payment Slip Received",
                    message: `${userDoc?.name || "A student"} submitted a payment slip for "${courseDoc?.title}". PKR ${amount} via ${method}.`,
                    meta: { paymentId: payment._id.toString(), courseId, studentId: userId },
                });
            }
        } catch (notifErr) { console.error("Wallet pending notif failed:", notifErr); }

        return NextResponse.json({ success: true, message: "Slip uploaded & submitted successfully!", data: payment });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// ADMIN REVENUE
// ─────────────────────────────────────────────
export const getAdminRevenue = async (req: Request) => {
    try {
        await dbConnect();
        const authResult = await validateRequest(req);
        if (!authResult.success || !authResult.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const walletPayments = await Payment.find({ status: "approved" });
        const walletRevenue = walletPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        const walletPairs = walletPayments.map((p: any) => `${p.user?.toString()}_${p.course?.toString()}`);
        const allEnrollments = await Enrollment.find({}).populate("course", "price");
        const stripeEnrollments = allEnrollments.filter((e: any) => !walletPairs.includes(`${e.user?.toString()}_${e.course?.toString()}`));
        const stripeRevenue = stripeEnrollments.reduce((sum: number, e: any) => {
            const price = Number(e.course?.price) || 0;
            return sum + (e.accessType === "half" ? Math.round(price / 2) : price);
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
        const authResult = await validateRequest(req);
        if (!authResult.success || !authResult.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const enrollments = await Enrollment.find({}).populate("course", "price title");
        const walletPayments = await Payment.find({ status: "approved" }).lean();
        const walletPairs = walletPayments.map((p: any) => `${p.user?.toString()}_${p.course?.toString()}`);
        const stateMap: Record<string, { students: number; revenue: number }> = {};

        enrollments.forEach((e: any) => {
            const courseId = e.course?._id?.toString();
            if (!courseId) return;
            if (!stateMap[courseId]) stateMap[courseId] = { students: 0, revenue: 0 };
            stateMap[courseId].students += 1;
            const pair = `${e.user?.toString()}_${courseId}`;
            if (!walletPairs.includes(pair)) {
                const price = Number(e.course?.price) || 0;
                stateMap[courseId].revenue += e.accessType === "half" ? Math.round(price / 2) : price;
            }
        });

        walletPayments.forEach((p: any) => {
            const courseId = p.course?.toString();
            if (!courseId) return;
            if (!stateMap[courseId]) stateMap[courseId] = { students: 0, revenue: 0 };
            stateMap[courseId].revenue += Number(p.amount) || 0;
        });

        return NextResponse.json({ success: true, stats: stateMap });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ─────────────────────────────────────────────
// GET ALL WALLET PAYMENTS (Admin)
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
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({ success: true, data: payments });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// APPROVE WALLET PAYMENT (Admin)
// ─────────────────────────────────────────────
export async function ApproveWalletPayment(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();

        const payment = await Payment.findById(paymentId)
            .populate("user", "name email")
            .populate("course", "title");

        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

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

        // ── Email ──
        try {
            if (userObj?.email && courseObj?.title) {
                await sendPaymentApprovedEmail({
                    toEmail: userObj.email,
                    userName: userObj.name || "Student",
                    courseName: courseObj.title,
                    amount: (payment as any).amount,
                    accessType: accessType as "half" | "full",
                });
            }
        } catch (emailErr) { console.error("Approval email failed:", emailErr); }

        // ── Notification ──
        try {
            await createNotification({
                userId: userObj._id.toString(),
                type: "payment_approved",
                title: "✅ Payment Approved!",
                message: `Your payment for "${courseObj.title}" has been approved. ${accessType === "half" ? "You have access to first 50% videos." : "You have full access to all videos!"} 🎉`,
                meta: { paymentId, courseId: courseObj._id.toString() },
            });
        } catch (notifErr) { console.error("Approval notification failed:", notifErr); }

        return NextResponse.json({ success: true, message: "Payment approved & access granted!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// REJECT WALLET PAYMENT (Admin)
// ─────────────────────────────────────────────
export async function RejectWalletPayment(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();

        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            { status: "rejected" },
            { new: true }
        )
            .populate("user", "name email")
            .populate("course", "title");

        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        const userObj: any = payment.user;
        const courseObj: any = payment.course;

        // ── Email ──
        try {
            if (userObj?.email && courseObj?.title) {
                await sendPaymentRejectedEmail({
                    toEmail: userObj.email,
                    userName: userObj.name || "Student",
                    courseName: courseObj.title,
                    amount: (payment as any).amount,
                });
            }
        } catch (emailErr) { console.error("Rejection email failed:", emailErr); }

        // ── Notification ──
        try {
            await createNotification({
                userId: userObj._id.toString(),
                type: "payment_rejected",
                title: "❌ Payment Rejected",
                message: `Your payment for "${courseObj.title}" could not be verified. Please try again with a clear screenshot.`,
                meta: { paymentId, courseId: courseObj._id.toString() },
            });
        } catch (notifErr) { console.error("Rejection notification failed:", notifErr); }

        return NextResponse.json({ success: true, message: "Payment rejected & email sent!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}