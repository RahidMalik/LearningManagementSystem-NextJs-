import nodemailer from "nodemailer";

export async function POST(req: Request) {
    const { email, method, amount } = await req.json();

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: '"Your LMS" <noreply@lms.com>',
        to: email,
        subject: `Payment Instructions for ${method}`,
        html: `
      <h2>Complete Your Payment</h2>
      <p>Please send <b>PKR ${amount}</b> to our ${method} account:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        <p><b>Account Number:</b> 0300-1234567</p>
        <p><b>Account Title:</b> Your Company Name</p>
      </div>
      <p>After sending, please upload the screenshot on the website.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
    return Response.json({ success: true });
}