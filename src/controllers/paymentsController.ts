// src/app/api/payment/create-intent/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import mongoose from "mongoose";
import { Enrollment } from "@/models/Enrollment";
import { Payment } from "@/models/Payment";


export async function PaymentIntentCreate(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
        await dbConnect();

        // 1. Auth check
        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const { courseId } = await request.json();

        // 2. Validate courseId
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        // 3. Course fetch karo real price ke liye
        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // 4. Final price calculate karo (discount apply)
        const discount = course.discount || 0;
        const finalPrice = Math.round(course.price - (course.price * discount) / 100);
        const amountInPaisa = finalPrice * 100; // Stripe cents mein leta hai

        // 5. PaymentIntent create karo
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaisa,
            currency: "pkr", // PKR
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


export async function PaymentIntentWebhook(request: NextRequest) {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
        const body = await request.text();
        const signature = request.headers.get("stripe-signature")!;

        // 1. Webhook verify 
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error("Webhook signature failed:", err.message);
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Payment successful hone pe enroll karo
        if (event.type === "payment_intent.succeeded") {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const { courseId, userId } = paymentIntent.metadata;

            await dbConnect();

            // Already enrolled check
            const alreadyEnrolled = await Enrollment.findOne({
                user: userId,
                course: courseId,
            });

            if (!alreadyEnrolled) {
                await Enrollment.create({
                    user: userId,
                    course: courseId,
                    progress: 0,
                });
                console.log(`✅ Enrolled: User ${userId} in Course ${courseId}`);
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Stripe ke liye body parsing band karo
export const config = {
    api: { bodyParser: false },
};

export async function WalletVerification(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Frontend se aane wala data
        const { courseId, method, phone, amount, userId, receiptUrl } = body;

        // 1. Basic Validation
        if (!receiptUrl) {
            return NextResponse.json(
                { success: false, message: "Payment screenshot (slip) is required." },
                { status: 400 }
            );
        }

        // 2. Create Pending Payment record
        const payment = await Payment.create({
            user: userId,
            course: courseId,
            amount,
            paymentMethod: method, // EasyPaisa or JazzCash
            senderPhone: phone,
            receiptUrl: receiptUrl, // Cloudinary ka image link
            status: "pending",
        });

        return NextResponse.json({
            success: true,
            message: "Slip submitted successfully! Access will be granted after verification.",
            data: payment
        });

    } catch (error: any) {
        console.error("Wallet Verification Error:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}