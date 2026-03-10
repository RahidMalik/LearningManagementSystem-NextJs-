// app/api/courses/update-progress/route.ts

import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request);
        if (!auth.success)
            return NextResponse.json({ error: auth.error }, { status: 401 });

        const { courseId, progress } = await request.json();

        if (!courseId || progress === undefined)
            return NextResponse.json({ error: "courseId and progress required" }, { status: 400 });

        // Clamp 0–100
        const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

        const enrollment = await Enrollment.findOneAndUpdate(
            { user: auth.user.userId, course: courseId, status: "active" },
            { $set: { progress: clampedProgress } },
            { new: true }
        );

        if (!enrollment)
            return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

        return NextResponse.json({ success: true, progress: clampedProgress });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}