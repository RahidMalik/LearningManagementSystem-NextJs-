import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { Enrollment } from "@/models/Enrollment";
import validateRequest from "@/middleware/authMiddleware";

export const getAllStudents = async (req: Request) => {
    try {
        await dbconnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
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
                const courseCount = await Enrollment.countDocuments({
                    user: student._id
                });
                return { ...student, courseCount };
            })
        );

        return NextResponse.json({
            success: true,
            count: students.length,
            totalStudents: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: studentsWithCourses
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// StudentAccess___________________

export const toggleStudentAccess = async (req: Request) => {
    try {
        await dbconnect();

        const authResult = await validateRequest(req);
        if (!authResult.success) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, status } = await req.json();

        const user = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        ).select("-password");

        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};