import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export const getAllStudents = async () => {
    try {
        await dbconnect();
        const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};