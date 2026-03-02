// src/app/api/payment/wallet-verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Payment } from "@/models/Payment";
import mongoose from "mongoose";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const { courseId, method, phone, amount, receiptUrl } = await request.json();

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }
        if (!receiptUrl) {
            return NextResponse.json({ error: "Receipt image required" }, { status: 400 });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // ✅ Payment DB mein save karo
        await Payment.create({
            user: auth.user.userId,
            course: courseId,
            amount,
            paymentMethod: method,
            senderPhone: phone,
            receiptUrl,
            status: "pending",
        });

        // ✅ EMAIL_USER aur EMAIL_PASS — same as .env.local
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"LMS Academy" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // admin ko hi bhejo
            subject: `💰 New ${method} Payment Slip — ${course.title}`,
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    <div style="background:#0a348f;padding:24px;color:white;">
                        <h2 style="margin:0;">New Wallet Payment Slip</h2>
                    </div>
                    <div style="padding:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td style="padding:8px 0;color:#64748b;width:100px;">Method</td><td><b>${method}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td><b>${phone}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">Course</td><td><b>${course.title}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">Amount</td><td><b>PKR ${amount}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">User ID</td><td><b>${auth.user.userId}</b></td></tr>
                        </table>
                        <div style="margin-top:20px;">
                            <p style="color:#64748b;margin-bottom:8px;">Payment Receipt:</p>
                            <img src="${receiptUrl}" style="width:100%;border-radius:8px;border:1px solid #e2e8f0;" />
                        </div>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({
            success: true,
            message: "Receipt submitted. Admin will verify and enroll you shortly.",
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}