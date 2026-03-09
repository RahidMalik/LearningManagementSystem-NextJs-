// app/api/courses/enroll/route.ts
import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import { enrollCourse } from "@/controllers/courseController";

export async function POST(req: NextRequest) {
    const auth = await validateRequest(req) as any;
    if (!auth.success) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, accessType } = body;

    return enrollCourse({
        userId: auth.user.userId,
        courseId,
        accessType: accessType || "full",
    });
}