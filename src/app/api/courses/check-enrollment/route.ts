// src/app/api/courses/check-enrollment/route.ts

import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";

// ✅ AuthResult type
interface AuthResult {
    success: boolean;
    error?: string;
    user: {
        userId: string;
        email?: string;
        role?: string;
    };
}

export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // ✅ Auth check — userId nikalo
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) {
            // Token nahi hai — enrolled nahi mano, error mat do
            return NextResponse.json({ success: true, isEnrolled: false }, { status: 200 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get("courseId");

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ success: true, isEnrolled: false }, { status: 200 });
        }

        // ✅ DB se check karo
        const existingEnrollment = await Enrollment.findOne({
            user: auth.user.userId,
            course: courseId,
        });

        return NextResponse.json({
            success: true,
            isEnrolled: !!existingEnrollment,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: true, isEnrolled: false }, { status: 200 });
    }
}