import dbConnect from "@/configs/mongodb";
import { adminGuard } from "@/middleware/AdminGuard";
import { enrollmentGuard } from "@/middleware/EnrollmentGuard";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

interface CourseData {
    userId: string;
    courseId: string;
}

// 1. CREATE COURSE (Only For Admin)
export const createCourse = async (req: Request) => {
    try {
        // --- Middleware Check ---
        const adminCheck = await adminGuard(req);
        if (!adminCheck.success) return adminCheck.response;

        await dbConnect();
        const body = await req.json();

        if (!body.title || !body.price || !body.category) {
            return NextResponse.json({ error: "Title, Price and Category are required!" }, { status: 400 });
        }

        const newCourse = await Course.create(body);
        return NextResponse.json({ success: true, message: "Course added!", data: newCourse }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};


//TODO 2. Get all courses (Public)
export const getAllCourses = async () => {
    try {
        await dbConnect();
        const courses = await Course.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: courses.length, data: courses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

//! Enroll Courses (Private)
export const enrollCourse = async (req: CourseData) => {
    try {
        // 1. Middleware Check
        const auth = await enrollmentGuard(req);

        if (!auth.success) return auth.response;

        const userId = auth.userId;

        const { courseId } = req;

        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID format" }, { status: 400 });
        }

        const courseExist = await Course.findById(courseId);

        if (!courseExist) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
        }

        // Create Enrollment
        const newEnroll = await Enrollment.create({ user: userId, course: courseId });

        return NextResponse.json({
            success: true,
            message: "Enrolled Successfully",
            data: newEnroll
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};