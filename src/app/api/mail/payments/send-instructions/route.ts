// src/app/api/payment/send-instructions/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const { email, method, amount, phone } = await req.json();

        if (!email || !method || !amount || !phone) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // ✅ 1. User ko instructions email
        await transporter.sendMail({
            from: `"LMS Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Payment Instructions — ${method}`,
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    <div style="background:#0a348f;padding:24px;color:white;">
                        <h2 style="margin:0;">Complete Your Payment</h2>
                    </div>
                    <div style="padding:24px;">
                        <p>Please send <b>PKR ${amount}</b> to our ${method} account:</p>
                        <div style="background:#f8fafc;padding:16px;border-radius:8px;margin:16px 0;border:1px solid #e2e8f0;">
                            <p style="margin:6px 0;"><b>Account Number:</b> ${method === "EasyPaisa" ? "0300-1234567" : "0321-7654321"}</p>
                            <p style="margin:6px 0;"><b>Account Title:</b> LMS Academy</p>
                            <p style="margin:6px 0;"><b>Amount:</b> PKR ${amount}</p>
                        </div>
                        <p>After sending, come back to the website and upload the payment screenshot.</p>
                        <p style="color:#64748b;font-size:12px;margin-top:16px;">Your registered number: <b>+92${phone}</b></p>
                    </div>
                </div>
            `,
        });

        // ✅ 2. Admin ko notification — user details ke saath
        await transporter.sendMail({
            from: `"LMS Academy" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `🔔 New ${method} Payment Request`,
            html: `
                <div style="font-family:sans-serif;max-width:500px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                    <div style="background:#0a348f;padding:24px;color:white;">
                        <h2 style="margin:0;">New Payment Request</h2>
                    </div>
                    <div style="padding:24px;">
                        <table style="width:100%;border-collapse:collapse;">
                            <tr><td style="padding:8px 0;color:#64748b;width:120px;">Method</td><td><b>${method}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">User Email</td><td><b>${email}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">User Phone</td><td><b>+92${phone}</b></td></tr>
                            <tr><td style="padding:8px 0;color:#64748b;">Amount</td><td><b>PKR ${amount}</b></td></tr>
                        </table>
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Email error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}