import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { Enrollment } from "@/models/Enrollment";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";

import "@/models/Course";
export const getAllStudents = async (req: Request) => {
    try {
        await dbConnect();

        const auth = await validateRequest(req as any) as any;
        if (!auth.success || auth.user?.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "100");
        const skip = (page - 1) * limit;

        const students = await User.find({ role: "student" })
            .select("name email photoURL createdAt phone")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments({ role: "student" });

        const studentsWithCourses = await Promise.all(
            students.map(async (student: any) => {
                const enrollments = await Enrollment.find({ user: student._id })
                    .populate("course", "title thumbnail price")
                    .select("course accessType progress")
                    .lean();

                return {
                    ...student,
                    courseCount: enrollments.length,
                    enrollments: enrollments.map((e: any) => ({
                        enrollmentId: e._id,
                        courseId: e.course?._id,
                        title: e.course?.title || "Unknown Course",
                        thumbnail: e.course?.thumbnail || "",
                        price: e.course?.price || 0,
                        accessType: e.accessType || "full",
                        progress: e.progress || 0,
                    })),
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: studentsWithCourses,
            totalStudents: total,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};