import { NextResponse } from "next/server";
import dbconnect from "@/configs/mongodb";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";

export const enrollmentGuard = async (data: { userId: string, courseId: string }) => {

    if (!data.courseId || !mongoose.Types.ObjectId.isValid(data.courseId)) {
        return {
            success: false,
            response: NextResponse.json({ error: "Invalid Course ID" }, { status: 400 })
        };
    }

    if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
        return {
            success: false,
            response: NextResponse.json({ error: "Invalid User ID" }, { status: 400 })
        };
    }

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

    return { success: true, userId: data.userId };
};