import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import { Enrollment } from "@/models/Enrollment";
import validateRequest from "@/middleware/authMiddleware";
import dbConnect from "@/configs/mongodb";

export const getAllStudents = async (req: Request) => {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "100");
        const skip = (page - 1) * limit;
        const students = await User.find({ role: "student" })
            .select("-password")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments({ role: "student" });

        const studentsWithCourses = await Promise.all(
            students.map(async (student: any) => {
                const courseCount = await Enrollment.countDocuments({ user: student._id });
                return {
                    ...student,
                    courseCount,
                    enrolledCourses: new Array(courseCount),
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
