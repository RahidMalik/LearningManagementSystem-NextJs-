import { NextResponse } from "next/server";
import dbconnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";

export const enrollmentGuard = async (data: { userId: string, courseId: string }) => {
    await dbconnect();
    const isEnrolled = await Enrollment.findOne({ user: data.userId, course: data.courseId });

    if (!isEnrolled) {
        return {
            success: false,
            response: NextResponse.json({
                error: "Access Denied. You are not enrolled in this course."
            }, { status: 402 })
        };
    }
    return { success: true, userId: data.userId }; // userId add kar di
};