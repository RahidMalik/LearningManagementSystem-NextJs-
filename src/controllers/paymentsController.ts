import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { Payment } from "@/models/Payment";
import cloudinary from "@/configs/cloudinary";
import { sendPaymentApprovedEmail, sendPaymentRejectedEmail, sendPaymentPendingEmail } from "@/app/api/mail/payments/emailService/route";

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
                // upgrade allowed — continue
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
            chargeAmount = Math.round(fullPrice / 2); // upgrade: remaining half
        } else if (accessType === "half") {
            chargeAmount = Math.round(fullPrice / 2); // new half
        } else {
            chargeAmount = fullPrice;                 // new full
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
// ENROLL IN COURSE
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

        if (enrollment.status === "revoked") {
            return NextResponse.json({
                isEnrolled: false,
                isRevoked: true,
                accessType: null,
                paymentMethod: null,
            });
        }

        const walletPayment = await Payment.findOne({ user: auth.user.userId, course: courseId });
        const paymentMethod = walletPayment ? "wallet" : "card";

        return NextResponse.json({
            isEnrolled: true,
            accessType: enrollment.accessType ?? null,
            paymentMethod,
        });
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

        // ✅ Send pending email
        try {
            const User = (await import("@/models/User")).User;
            const Course = (await import("@/models/Course")).Course;
            const userDoc = await User.findById(userId).select("name email");
            const courseDoc = await Course.findById(courseId).select("title");
            if (userDoc?.email && courseDoc?.title) {
                await sendPaymentPendingEmail({
                    toEmail: userDoc.email,
                    userName: userDoc.name || "Student",
                    courseName: courseDoc.title,
                    amount: Number(amount),
                    method: method,
                });
            }
        } catch (emailErr) { console.error("Pending email failed:", emailErr); }

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
        const allEnrollments = await Enrollment.find({ status: "active" }).populate("course", "price");
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

        const enrollments = await Enrollment.find({ status: "active" }).populate("course", "price title");
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

        // ✅ FIX: await was missing — was returning a Query object not data
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
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();
        if (!paymentId)
            return NextResponse.json({ error: "paymentId required" }, { status: 400 });

        const payment = await Payment.findById(paymentId);
        if (!payment)
            return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        const accessType = (payment as any).accessType || "full";

        // ✅ Check FIRST — before touching payment status
        const existing = await Enrollment.findOne({ user: payment.user, course: payment.course });

        if (existing && existing.accessType === "full") {
            // ⚠️ Already fully enrolled — do NOT approve, just warn
            return NextResponse.json({
                success: true,
                alreadyEnrolled: true,
                message: "User is already fully enrolled. No change made.",
            });
        }

        // ✅ Only now mark approved
        payment.status = "approved";
        await payment.save();

        if (existing && existing.accessType === "half" && accessType === "full") {
            // Upgrade half → full
            existing.accessType = "full";
            await existing.save();
        } else if (!existing) {
            // New enrollment
            await Enrollment.create({
                user: payment.user,
                course: payment.course,
                accessType,
                status: "active",
                progress: 0,
            });
        }

        // ✅ Send approval email
        try {
            const populatedPayment = await Payment.findById(paymentId)
                .populate("user", "name email")
                .populate("course", "title price");
            const u = (populatedPayment as any)?.user;
            const c = (populatedPayment as any)?.course;
            if (u?.email && c?.title) {
                await sendPaymentApprovedEmail({
                    toEmail: u.email,
                    userName: u.name || "Student",
                    courseName: c.title,
                    amount: (populatedPayment as any).amount,
                    accessType: accessType as "half" | "full",
                });
            }
        } catch (emailErr) { console.error("Approval email failed:", emailErr); }

        return NextResponse.json({ success: true, alreadyEnrolled: false, message: "Payment approved & user access granted!" });
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
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { paymentId } = await request.json();
        if (!paymentId)
            return NextResponse.json({ error: "paymentId required" }, { status: 400 });

        const payment = await Payment.findByIdAndUpdate(paymentId, { status: "rejected" }, { new: true });
        if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

        // ✅ Send rejection email
        try {
            const pop = await Payment.findById(paymentId)
                .populate("user", "name email")
                .populate("course", "title");
            const u = (pop as any)?.user;
            const c = (pop as any)?.course;
            if (u?.email && c?.title) {
                await sendPaymentRejectedEmail({
                    toEmail: u.email,
                    userName: u.name || "Student",
                    courseName: c.title,
                    amount: (pop as any).amount,
                });
            }
        } catch (emailErr) { console.error("Rejection email failed:", emailErr); }

        return NextResponse.json({ success: true, message: "Payment rejected" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}