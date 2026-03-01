import cloudinary from "@/configs/cloudinary";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export interface CourseData {
    userId: string;
    courseId: string;
}

// ============================================================
// --- HELPER: Cloudinary Upload ---
// ============================================================
const uploadToCloudinary = async (file: File, resourceType: "image" | "video"): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "LMS_COURSES",
                resource_type: resourceType,
            },
            (err, result) => {
                if (err) {
                    console.error("Cloudinary Upload Error:", err);
                    return reject(err);
                }
                resolve(result?.secure_url || "");
            }
        );
        uploadStream.end(buffer);
    });
};

// ==========================================
// 1. Create Course (Admin Only)
// ==========================================
export const createCourse = async (req: Request) => {
    try {
        await dbConnect();
        const data = await req.formData();

        const title = data.get("title") as string;
        const price = data.get("price") as string;
        const category = data.get("category") || "General";
        const thumbnailFile = data.get("thumbnail") as File;
        const videoFile = data.get("videoFile") as File;

        if (!title || !price || !thumbnailFile || !videoFile || !category) {
            return NextResponse.json({ error: "Missing required fields!" }, { status: 400 });
        }

        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadToCloudinary(thumbnailFile, "image"),
            uploadToCloudinary(videoFile, "video")
        ]);

        const newCourse = await Course.create({
            title,
            price: Number(price),
            category,
            thumbnail: thumbnailUrl,
            videoUrl: videoUrl,
            instructor: "admin"
        });

        return NextResponse.json({
            success: true,
            message: "Course published successfully!",
            course: newCourse
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 2. Update Course (Admin Only)
// ==========================================
export const updateCourse = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();

        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Course ID Format" }, { status: 400 });
        }

        const courseExist = await Course.findById(id);
        if (!courseExist) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        const formData = await req.formData();
        let thumbnailUrl = courseExist.thumbnail;
        let videoUrl = courseExist.videoUrl;

        const newThumbnail = formData.get("thumbnail");
        if (newThumbnail instanceof File && newThumbnail.size > 0) {
            thumbnailUrl = await uploadToCloudinary(newThumbnail, "image");
        }

        const newVideo = formData.get("videoFile");
        if (newVideo instanceof File && newVideo.size > 0) {
            videoUrl = await uploadToCloudinary(newVideo, "video");
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            id,
            {
                title: formData.get("title") || courseExist.title,
                price: Number(formData.get("price")) || courseExist.price,
                category: formData.get("category") || courseExist.category,
                thumbnail: thumbnailUrl,
                videoUrl: videoUrl
            },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 3. Delete Course (Admin Only)
// ==========================================
export const deleteCourse = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const resolvedParams = await params;
        const id = resolvedParams.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID Format" }, { status: 400 });
        }

        const courseDelete = await Course.findByIdAndDelete(id);

        if (!courseDelete) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Course deleted successfully"
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
};

// ==========================================
// 4. Get All Courses (Public)
// ==========================================
export const getAllCourses = async () => {
    try {
        await dbConnect();
        const courses = await Course.find({}).sort({ createdAt: -1 });
        return NextResponse.json({
            success: true,
            count: courses.length,
            courses: courses
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 5. Get Single Course Details (For Students)
// ==========================================
export const getCourseDetails = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const course = await Course.findById(id);

        if (!course) {
            return NextResponse.json({ error: "Course not found!" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: course
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 6. Enroll Course (Private)
// ==========================================
export const enrollCourse = async (req: CourseData) => {
    try {
        await dbConnect();
        const { userId, courseId } = req;

        // 1. Validation (User aur Course dono ki ID check karein)
        if (!userId || userId === "" || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid or missing User ID" }, { status: 400 });
        }

        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        // 2. Check if course exists
        const courseExist = await Course.findById(courseId);
        if (!courseExist) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        // 3. Check for existing enrollment
        const existingEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId
        });

        if (existingEnrollment) {
            return NextResponse.json({ error: "You are already enrolled in this course" }, { status: 400 });
        }

        // 4. Create Enrollment
        const createdEnroll = await Enrollment.create({
            user: userId,
            course: courseId,
            progress: 0 // Default progress set kar dein
        });

        // 5. Re-fetch with Populate (Taake frontend ko full data mile)
        const newEnroll = await Enrollment.findById(createdEnroll._id)
            .populate("course")
            .lean();

        return NextResponse.json({
            success: true,
            data: newEnroll || [] // Empty array
        }, { status: 200 }); // 201 Created is better here

    } catch (error: any) {
        console.error("Enrollment Controller Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};