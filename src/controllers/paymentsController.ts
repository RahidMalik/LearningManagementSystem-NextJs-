import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { Payment } from "@/models/Payment";
import cloudinary from "@/configs/cloudinary";

export async function PaymentIntentCreate(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
        await dbConnect();

        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const { courseId } = await request.json();

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const existingEnrollment = await Enrollment.findOne({
            user: auth.user.userId,
            course: courseId
        });

        if (existingEnrollment) {
            return NextResponse.json({
                success: false,
                error: "You are already enrolled in this course.",
                alreadyEnrolled: true
            }, { status: 400 });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        const discount = course.discount || 0;
        const finalPrice = Math.round(course.price - (course.price * discount) / 100);
        const amountInPaisa = finalPrice * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaisa,
            currency: "pkr",
            metadata: {
                courseId: courseId,
                userId: auth.user.userId,
                courseName: course.title,
            },
        });

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: finalPrice,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function WalletVerification(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { courseId, method, phone, amount, userId, image } = body;

        if (!image) {
            return NextResponse.json({ success: false, message: "Payment screenshot is required." }, { status: 400 });
        }

        const uploadResponse = await cloudinary.uploader.upload(image, { folder: "lms_slips" });
        const receiptUrl = uploadResponse.secure_url;

        const payment = await Payment.create({
            user: userId, course: courseId, amount,
            paymentMethod: method, senderPhone: phone,
            receiptUrl, status: "pending",
        });

        return NextResponse.json({ success: true, message: "Slip uploaded & submitted successfully!", data: payment });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message || "Internal Server Error" }, { status: 500 });
    }
}