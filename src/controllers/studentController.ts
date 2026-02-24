import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
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
            .limit(limit);

        const total = await User.countDocuments({ role: "student" });

        return NextResponse.json({
            success: true,
            count: students.length,
            totalStudents: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: students
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};