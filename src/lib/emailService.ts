// src/lib/emailService.ts
import nodemailer from "nodemailer";

const makeTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ─────────────────────────────────────────────
// PAYMENT APPROVED EMAIL (Wallet)
// ─────────────────────────────────────────────
export async function sendPaymentApprovedEmail({
    toEmail, userName, courseName, amount, accessType,
}: {
    toEmail: string; userName: string; courseName: string;
    amount: number; accessType: "half" | "full";
}) {
    const isHalf = accessType === "half";
    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `✅ Payment Approved — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0a348f,#3b82f6);padding:32px 28px;text-align:center;">
                <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">Payment Approved! ✅</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Your payment has been verified successfully</p>
            </div>
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    Your payment for <b>${courseName}</b> has been approved.
                    ${isHalf
                ? "You now have access to the <b>first 50% of videos</b>. Complete remaining payment anytime to unlock all content."
                : "You now have <b>full access to all videos</b>. Happy learning! 🎉"}
                </p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:7px 0;color:#64748b;font-size:13px;width:130px;">Course</td><td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">${courseName}</td></tr>
                        <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Amount Paid</td><td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">PKR ${amount.toLocaleString()}</td></tr>
                        <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Access Level</td>
                            <td style="padding:7px 0;font-weight:700;font-size:13px;color:${isHalf ? "#f59e0b" : "#22c55e"};">
                                ${isHalf ? "⚡ Half Access (50% videos)" : "🌟 Full Access (All videos)"}
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${BASE_URL}/course/my-courses" style="background:#0a348f;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Start Learning →</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · Questions? Reply to this email</p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// PAYMENT REJECTED EMAIL (Wallet)
// ─────────────────────────────────────────────
export async function sendPaymentRejectedEmail({
    toEmail, userName, courseName, amount,
}: {
    toEmail: string; userName: string; courseName: string; amount: number;
}) {
    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `❌ Payment Not Verified — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#dc2626,#ef4444);padding:32px 28px;text-align:center;">
                <span style="font-size:40px;">❌</span>
                <h1 style="color:white;margin:8px 0 0;font-size:22px;font-weight:800;">Payment Rejected</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">We could not verify your payment</p>
            </div>
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    Your payment of <b>PKR ${amount.toLocaleString()}</b> for <b>${courseName}</b> could not be verified.
                </p>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <p style="color:#dc2626;font-weight:700;font-size:13px;margin:0 0 10px;">Possible reasons:</p>
                    <ul style="color:#ef4444;font-size:13px;margin:0;padding-left:18px;line-height:1.8;">
                        <li>Screenshot was unclear or invalid</li>
                        <li>Payment amount did not match</li>
                        <li>Payment was sent to wrong account</li>
                        <li>Transaction could not be confirmed</li>
                    </ul>
                </div>
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${BASE_URL}/course" style="background:#0a348f;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Try Again →</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · Need help? Reply to this email</p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// PAYMENT PENDING EMAIL (Wallet slip upload)
// ─────────────────────────────────────────────
export async function sendPaymentPendingEmail({
    toEmail, userName, courseName, amount, method,
}: {
    toEmail: string; userName: string; courseName: string;
    amount: number; method: string;
}) {
    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `⏳ Payment Under Review — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#d97706,#f59e0b);padding:32px 28px;text-align:center;">
                <span style="font-size:40px;">⏳</span>
                <h1 style="color:white;margin:8px 0 0;font-size:22px;font-weight:800;">Payment Under Review</h1>
                <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:13px;">We received your payment slip</p>
            </div>
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    We received your <b>${method}</b> payment slip for <b>${courseName}</b>.
                    Our team will verify within <b>24 hours</b> and grant you access.
                </p>
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:7px 0;color:#92400e;font-size:13px;width:130px;">Course</td><td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">${courseName}</td></tr>
                        <tr><td style="padding:7px 0;color:#92400e;font-size:13px;">Amount</td><td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">PKR ${amount.toLocaleString()}</td></tr>
                        <tr><td style="padding:7px 0;color:#92400e;font-size:13px;">Method</td><td style="padding:7px 0;color:#78350f;font-weight:600;font-size:13px;">${method}</td></tr>
                        <tr><td style="padding:7px 0;color:#92400e;font-size:13px;">Status</td><td style="padding:7px 0;font-weight:700;font-size:13px;color:#d97706;">⏳ Pending Verification</td></tr>
                    </table>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · You will receive another email once verified</p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// CARD PAYMENT SUCCESS EMAIL ✨ NEW
// Half ya Full dono handle karta hai
// ─────────────────────────────────────────────
export async function sendCardPaymentSuccessEmail({
    toEmail, userName, courseName, amount, accessType,
}: {
    toEmail: string; userName: string; courseName: string;
    amount: number; accessType: "half" | "full";
}) {
    const isHalf = accessType === "half";
    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🎉 Enrollment Confirmed — ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 28px;text-align:center;">
                <span style="font-size:40px;">🎉</span>
                <h1 style="color:white;margin:8px 0 0;font-size:22px;font-weight:800;">
                    ${isHalf ? "Half Access Activated!" : "Enrollment Confirmed!"}
                </h1>
                <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:13px;">Card payment successful</p>
            </div>
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    Your card payment for <b>${courseName}</b> was successful.
                    ${isHalf
                ? "You now have access to the <b>first 50% of course videos</b>. You can upgrade to full access anytime from your dashboard."
                : "You now have <b>full access to all course content</b>. Start learning right away! 🚀"}
                </p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:7px 0;color:#166534;font-size:13px;width:130px;">Course</td><td style="padding:7px 0;color:#14532d;font-weight:600;font-size:13px;">${courseName}</td></tr>
                        <tr><td style="padding:7px 0;color:#166534;font-size:13px;">Amount Paid</td><td style="padding:7px 0;color:#14532d;font-weight:600;font-size:13px;">PKR ${amount.toLocaleString()}</td></tr>
                        <tr><td style="padding:7px 0;color:#166534;font-size:13px;">Payment Method</td><td style="padding:7px 0;color:#14532d;font-weight:600;font-size:13px;">💳 Card</td></tr>
                        <tr><td style="padding:7px 0;color:#166534;font-size:13px;">Access Level</td>
                            <td style="padding:7px 0;font-weight:700;font-size:13px;color:${isHalf ? "#f59e0b" : "#059669"};">
                                ${isHalf ? "⚡ Half Access (First 50%)" : "🌟 Full Access (All content)"}
                            </td>
                        </tr>
                    </table>
                </div>
                ${isHalf ? `
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;">
                    <p style="color:#92400e;font-size:13px;margin:0;">
                        💡 <b>Upgrade Anytime</b> — Pay the remaining half to unlock all videos
                    </p>
                </div>` : ""}
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${BASE_URL}/course/my-courses" style="background:#059669;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Start Learning →</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · Happy Learning! 🎓</p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// LOGIN EMAIL ✨ NEW
// ─────────────────────────────────────────────
export async function sendLoginEmail({
    toEmail, userName, loginTime, device,
}: {
    toEmail: string; userName: string;
    loginTime?: string; device?: string;
}) {
    const time = loginTime || new Date().toLocaleString("en-PK", {
        timeZone: "Asia/Karachi",
        dateStyle: "medium", timeStyle: "short",
    });

    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🔐 New Login Detected — Cybex LMS`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0a348f,#1d4ed8);padding:32px 28px;text-align:center;">
                <span style="font-size:40px;">🔐</span>
                <h1 style="color:white;margin:8px 0 0;font-size:22px;font-weight:800;">New Login Detected</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Someone just signed into your account</p>
            </div>
            <div style="padding:28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 20px;">Hi <b>${userName}</b>,</p>
                <p style="color:#475569;font-size:14px;margin:0 0 20px;">
                    A new login was detected on your Cybex LMS account. If this was you, no action needed.
                </p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:7px 0;color:#64748b;font-size:13px;width:130px;">Time</td><td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">${time}</td></tr>
                        ${device ? `<tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Device</td><td style="padding:7px 0;color:#1e293b;font-weight:600;font-size:13px;">${device}</td></tr>` : ""}
                        <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Status</td><td style="padding:7px 0;font-weight:700;font-size:13px;color:#22c55e;">✅ Successful</td></tr>
                    </table>
                </div>
                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;">
                    <p style="color:#dc2626;font-size:13px;margin:0;">
                        ⚠️ <b>Not you?</b> Change your password immediately and contact support.
                    </p>
                </div>
                <div style="text-align:center;margin-bottom:24px;">
                    <a href="${BASE_URL}/settings" style="background:#0a348f;color:white;padding:13px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">Secure My Account →</a>
                </div>
                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">Cybex LMS · This is an automated security email</p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// WELCOME EMAIL — sirf registration pe, login pe nahi
// ─────────────────────────────────────────────
export async function sendWelcomeEmail({
    toEmail, userName,
}: {
    toEmail: string;
    userName: string;
}) {
    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `🎉 Welcome to Cybex LMS — ${userName}!`,
        html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0a348f,#3b82f6);padding:40px 28px;text-align:center;">
                <span style="font-size:48px;">🎓</span>
                <h1 style="color:white;margin:12px 0 0;font-size:24px;font-weight:800;">Welcome to Cybex LMS!</h1>
                <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Your learning journey starts now</p>
            </div>
            <div style="padding:32px 28px;">
                <p style="color:#1e293b;font-size:15px;margin:0 0 16px;">Hi <b>${userName}</b> 👋</p>
                <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                    We're thrilled to have you on board! Your account has been created successfully.
                    Explore our courses and start building your skills today.
                </p>

                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <p style="color:#0a348f;font-weight:700;font-size:13px;margin:0 0 12px;">🚀 What you can do:</p>
                    <ul style="color:#475569;font-size:13px;margin:0;padding-left:18px;line-height:2;">
                        <li>Browse and enroll in courses</li>
                        <li>Pay via Card or Easypaisa / JazzCash</li>
                        <li>Track your learning progress</li>
                        <li>Message your instructor directly</li>
                    </ul>
                </div>

                <div style="text-align:center;margin-bottom:28px;">
                    <a href="${BASE_URL}/course"
                        style="background:#0a348f;color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
                        Explore Courses →
                    </a>
                </div>

                <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
                    Cybex LMS · If you didn't create this account, please ignore this email.
                </p>
            </div>
        </div>`,
    });
}

// ─────────────────────────────────────────────
// ADMIN — NEW SLIP EMAIL
// ─────────────────────────────────────────────
export async function sendAdminSlipEmail({
    studentName, studentEmail, courseName, amount, method, accessType, receiptUrl,
}: {
    studentName: string;
    studentEmail: string;
    courseName: string;
    amount: number;
    method: string;
    accessType: string;
    receiptUrl: string;
}) {
    const accessText = accessType === "half" ? "50% Half Access" : "Full Access";
    const methodUpper = method?.toUpperCase() || "WALLET";

    await makeTransporter().sendMail({
        from: `"Cybex LMS" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // admin email
        subject: `💰 New Payment Slip — ${studentName} · ${courseName}`,
        html: `
        <div style="font-family:sans-serif;max-width:580px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <div style="background:linear-gradient(135deg,#0a348f,#1d4ed8);padding:28px;text-align:center;">
                <span style="font-size:36px;">💰</span>
                <h1 style="color:white;margin:10px 0 0;font-size:20px;font-weight:800;">New Payment Slip Received</h1>
                <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Action required — please verify and approve</p>
            </div>
            <div style="padding:28px;">
                <!-- Student Details -->
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin-bottom:20px;">
                    <p style="color:#0a348f;font-weight:700;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Student Details</p>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:120px;">Name</td><td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:13px;">${studentName}</td></tr>
                        <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:6px 0;color:#1e293b;font-weight:600;font-size:13px;">${studentEmail}</td></tr>
                    </table>
                </div>

                <!-- Payment Details -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:18px;margin-bottom:20px;">
                    <p style="color:#92400e;font-weight:700;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:0.5px;">Payment Details</p>
                    <table style="width:100%;border-collapse:collapse;">
                        <tr><td style="padding:6px 0;color:#92400e;font-size:13px;width:120px;">Course</td><td style="padding:6px 0;color:#78350f;font-weight:600;font-size:13px;">${courseName}</td></tr>
                        <tr><td style="padding:6px 0;color:#92400e;font-size:13px;">Amount</td><td style="padding:6px 0;color:#78350f;font-weight:700;font-size:14px;">PKR ${amount.toLocaleString()}</td></tr>
                        <tr><td style="padding:6px 0;color:#92400e;font-size:13px;">Method</td><td style="padding:6px 0;color:#78350f;font-weight:600;font-size:13px;">${methodUpper}</td></tr>
                        <tr><td style="padding:6px 0;color:#92400e;font-size:13px;">Access</td><td style="padding:6px 0;font-weight:700;font-size:13px;color:#d97706;">${accessText}</td></tr>
                    </table>
                </div>

                <!-- Slip Image -->
                <div style="margin-bottom:24px;">
                    <p style="color:#475569;font-size:13px;font-weight:600;margin:0 0 10px;">📎 Payment Slip:</p>
                    <img src="${receiptUrl}" alt="Payment Slip"
                        style="width:100%;border-radius:10px;border:1px solid #e2e8f0;display:block;" />
                </div>
            </div>
        </div>`,
    });
}