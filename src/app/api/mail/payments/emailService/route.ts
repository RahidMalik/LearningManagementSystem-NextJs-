// src/lib/emailService.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ─────────────────────────────────────────────
// PAYMENT APPROVED EMAIL
// ─────────────────────────────────────────────
export async function sendPaymentApprovedEmail({
    toEmail, userName, courseName, amount, accessType,
}: {
    toEmail: string;
    userName: string;
    courseName: string;
    amount: number;
    accessType: "half" | "full";
}) {
    const isHalf = accessType === "half";

    await transporter.sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `✅ Payment Approved — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#0a348f,#3b82f6);padding:32px 28px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Payment Approved!</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Your payment has been verified successfully</p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    Great news! Your payment for <b>${courseName}</b> has been approved by our instructor.
                    ${isHalf
                ? "You now have access to the <b>first 50% of videos</b>. Complete your remaining payment anytime to unlock all content."
                : "You now have <b>full access to all videos</b> in the course. Happy learning! 🎉"
            }
                </p>

                <!-- Details card -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:7px 0;color:#64748b;font-size:13px;width:130px;">Course</td>
                            <td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">${courseName}</td>
                        </tr>
                        <tr>
                            <td style="padding:7px 0;color:#64748b;font-size:13px;">Amount Paid</td>
                            <td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">PKR ${amount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding:7px 0;color:#64748b;font-size:13px;">Access Level</td>
                            <td style="padding:7px 0;font-weight:700;font-size:13px;color:${isHalf ? "#f59e0b" : "#22c55e"};">
                                ${isHalf ? "⚡ Half Access (50% videos)" : "🌟 Full Access (All videos)"}
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}course/my-courses
                        style="background:#0a348f;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
                        Start Learning →
                    </a>
                </div>

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · Questions? Reply to this email</p>
            </div>
        </div>
        `,
    });
}

// ─────────────────────────────────────────────
// PAYMENT REJECTED EMAIL
// ─────────────────────────────────────────────
export async function sendPaymentRejectedEmail({
    toEmail, userName, courseName, amount,
}: {
    toEmail: string;
    userName: string;
    courseName: string;
    amount: number;
}) {
    await transporter.sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `❌ Payment Not Verified — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 28px;text-align:center;">
                <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 12px;">
                    <span style="font-size:28px;line-height:64px;">❌</span>
                </div>
                <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Payment Rejected</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">We could not verify your payment</p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    Unfortunately, your payment of <b>PKR ${amount.toLocaleString()}</b> for <b>${courseName}</b>
                    could not be verified by our team.
                </p>

                <!-- Possible reasons -->
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <p style="color:#dc2626;font-weight:700;font-size:13px;margin:0 0 10px;">Possible reasons:</p>
                    <ul style="color:#ef4444;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
                        <li>Screenshot was unclear or invalid</li>
                        <li>Payment amount did not match</li>
                        <li>Payment was sent to wrong account</li>
                        <li>Transaction could not be confirmed</li>
                    </ul>
                </div>

                <p style="color:#475569;font-size:14px;margin:0 0 24px;">
                    Please try again with a clear screenshot or contact us for help.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/course"
                        style="background:#0a348f;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
                        Try Again →
                    </a>
                </div>

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · Need help? Reply to this email</p>
            </div>
        </div>
        `,
    });
}

// ─────────────────────────────────────────────
// PAYMENT PENDING EMAIL (sent on slip upload)
// ─────────────────────────────────────────────
export async function sendPaymentPendingEmail({
    toEmail, userName, courseName, amount, method,
}: {
    toEmail: string;
    userName: string;
    courseName: string;
    amount: number;
    method: string;
}) {
    await transporter.sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `⏳ Payment Under Review — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:32px 28px;text-align:center;">
                <div style="width:64px;height:64px;background:rgba(255,255,255,0.15);border-radius:50%;margin:0 auto 12px;">
                    <span style="font-size:28px;line-height:64px;">⏳</span>
                </div>
                <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Payment Under Review</h1>
                <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:13px;">We received your payment slip</p>
            </div>

            <!-- Body -->
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    We have received your <b>${method}</b> payment slip for <b>${courseName}</b>.
                    Our team will verify it within <b>24 hours</b> and grant you access.
                </p>

                <!-- Details -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:7px 0;color:#92400e;font-size:13px;width:130px;">Course</td>
                            <td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">${courseName}</td>
                        </tr>
                        <tr>
                            <td style="padding:7px 0;color:#92400e;font-size:13px;">Amount</td>
                            <td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">PKR ${amount.toLocaleString()}</td>
                        </tr>
                        <tr>
                            <td style="padding:7px 0;color:#92400e;font-size:13px;">Method</td>
                            <td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">${method}</td>
                        </tr>
                        <tr>
                            <td style="padding:7px 0;color:#92400e;font-size:13px;">Status</td>
                            <td style="padding:7px 0;font-weight:700;font-size:13px;color:#d97706;">⏳ Pending Verification</td>
                        </tr>
                    </table>
                </div>

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · You will receive another email once verified</p>
            </div>
        </div>
        `,
    });
}