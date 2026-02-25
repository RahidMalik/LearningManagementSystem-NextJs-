import cloudinary from "@/configs/cloudinary";
import dbConnect from "@/configs/mongodb";
import { enrollmentGuard } from "@/middleware/EnrollmentGuard";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

interface CourseData {
    userId: string;
    courseId: string;
}

// ============================================================
// --- HELPER: Cloudinary Upload (Sab ke liye available hai) ---
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
        uploadStream.end(buffer); // ✅ Correctly placed inside the promise logic
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

        // Parallel Upload for speed
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
        console.error("CREATE_ERROR:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 2. Update Course (Admin Only)
// ==========================================
export const updateCourse = async (req: Request, { params }: { params: { courseId: string } }) => {
    try {
        const { courseId } = params;
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const formData = await req.formData();
        await dbConnect();

        const courseExist = await Course.findById(courseId);
        if (!courseExist) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        let thumbnailUrl = courseExist.thumbnail;
        let videoUrl = courseExist.videoUrl;

        // Check for new thumbnail
        const newThumbnail = formData.get("thumbnail");
        if (newThumbnail instanceof File && newThumbnail.size > 0) {
            thumbnailUrl = await uploadToCloudinary(newThumbnail, "image");
        }

        // Check for new video
        const newVideo = formData.get("videoFile");
        if (newVideo instanceof File && newVideo.size > 0) {
            videoUrl = await uploadToCloudinary(newVideo, "video");
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
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
        console.error("UPDATE_ERROR:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ==========================================
// 3. Delete Course (Admin Only)
// ==========================================
export const deleteCourse = async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const { id } = params;
        await dbConnect();
        const courseDelete = await Course.findByIdAndDelete(id);

        if (!courseDelete) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        return NextResponse.json({
            success: true,
            message: "Course deleted successfully"
        });
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
// 5. Enroll Course (Private)
// ==========================================
export const enrollCourse = async (req: CourseData) => {
    try {
        const auth = await enrollmentGuard(req);
        if (!auth.success) return auth.response;

        const userId = auth.userId;
        const { courseId } = req;

        await dbConnect();

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const courseExist = await Course.findById(courseId);
        if (!courseExist) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
        if (existingEnrollment) {
            return NextResponse.json({ error: "Already enrolled" }, { status: 400 });
        }

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