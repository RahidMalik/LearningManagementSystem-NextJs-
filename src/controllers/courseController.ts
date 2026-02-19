import dbconnect from "@/configs/mongodb";
import Course from "@/models/Course";
import { NextResponse } from "next/server";

// 1. Create Course (POST)
export const createCourse = async (req: Request) => {
    try {
        await dbconnect();
        const body = await req.json();

        if (!body.title || !body.price || !body.category) {
            return NextResponse.json({ error: "Title, Price and Category are required!" }, { status: 400 });
        }

        const newCourse = await Course.create(body);

        return NextResponse.json({
            success: true,
            message: "Course added successfully!",
            data: newCourse
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// 2. Course List (GET)
export const getAllCourses = async () => {
    try {
        await dbconnect();
        const courses = await Course.find({}).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};
// 3. Update Course
export const updateCourse = async (req: Request, id: string) => {
    try {
        await dbconnect();
        const body = await req.json();
        const updated = await Course.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// 4. Delete Course
export const deleteCourse = async (id: string) => {
    try {
        await dbconnect();
        await Course.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Course deleted!" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};