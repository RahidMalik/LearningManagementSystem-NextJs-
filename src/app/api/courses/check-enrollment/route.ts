// app/api/courses/check-enrollment/route.ts
import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";
import { Payment } from "@/models/Payment";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request) as any;
        if (!auth.success) {
            return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });
        }

        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        if (!courseId) {
            return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });
        }

        const enrollment = await Enrollment.findOne({
            user: auth.user.userId,
            course: courseId,
            status: "active",
        });

        if (!enrollment) {
            return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });
        }

        const walletPayment = await Payment.findOne({
            user: auth.user.userId,
            course: courseId,
        });

        const paymentMethod = walletPayment ? "wallet" : "card";

        return NextResponse.json({
            isEnrolled: true,
            accessType: enrollment.accessType ?? "full",
            paymentMethod,   // ← "card" | "wallet"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}