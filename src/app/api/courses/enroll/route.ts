// src/app/api/courses/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import { enrollCourse } from "@/controllers/courseController";
import validateRequest from "@/middleware/authMiddleware";

export async function POST(req: NextRequest) {
    const auth = await validateRequest(req);
    if (!auth.success) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { courseId } = await req.json();
    return enrollCourse({
        userId: auth.user.userId,
        courseId,
    });
}