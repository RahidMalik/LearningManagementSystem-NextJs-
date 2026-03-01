import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // 1. Auth check
        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        // 2. User ke saare enrolled courses fetch karo
        const enrollments = await Enrollment.find({ user: auth.user.userId })
            .populate("course")
            .lean();

        // 3. Null/invalid populate filter karo
        const validEnrollments = enrollments.filter((e: any) => e.course);

        return NextResponse.json({ success: true, data: validEnrollments }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}