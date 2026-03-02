import { checkEnrollmentStatus } from "@/controllers/courseController";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    return await checkEnrollmentStatus({
        userId: req.nextUrl.searchParams.get("userId") || "",
        courseId: req.nextUrl.searchParams.get("courseId") || "",
    });
}

