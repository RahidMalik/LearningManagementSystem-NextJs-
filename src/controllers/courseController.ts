// src/controllers/courseController.ts
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
// HELPER: Cloudinary Upload
// ============================================================
const uploadToCloudinary = async (
    file: File,
    resourceType: "image" | "video"
): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { folder: "LMS_COURSES", resource_type: resourceType },
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result?.secure_url || "");
                }
            )
            .end(buffer);
    });
};

// ============================================================
// HELPER: Parse + upload lectures
// ============================================================
const processLectures = async (
    formData: FormData,
    existingLectures: any[] = []
): Promise<{ title: string; videoUrl: string }[]> => {
    const lecturesRaw = formData.get("lectures") as string | null;
    if (!lecturesRaw) return existingLectures;

    let lecturesMeta: {
        title: string;
        videoUrl: string;
        hasNewVideo: boolean;
        fileIndex: number;
    }[] = [];

    try { lecturesMeta = JSON.parse(lecturesRaw); } catch { return existingLectures; }

    const results = await Promise.all(
        lecturesMeta.map(async (meta) => {
            // New video file uploaded?
            if (meta.hasNewVideo) {
                const videoFile = formData.get(`lectureVideo_${meta.fileIndex}`) as File | null;
                if (videoFile instanceof File && videoFile.size > 0) {
                    const url = await uploadToCloudinary(videoFile, "video");
                    return { title: meta.title, videoUrl: url };
                }
            }
            // Keep existing URL
            return { title: meta.title, videoUrl: meta.videoUrl || "" };
        })
    );

    return results;
};

// ============================================================
// 1. CREATE COURSE
// ============================================================
export const createCourse = async (req: Request) => {
    try {
        await dbConnect();
        const data = await req.formData();

        const title = data.get("title") as string;
        const price = data.get("price") as string;
        const category = (data.get("category") as string) || "General";
        const description = (data.get("description") as string) || "";
        const instructor = (data.get("instructor") as string) || "";
        const level = (data.get("level") as string) || "Beginner";
        const language = (data.get("language") as string) || "Urdu";
        const hours = (data.get("hours") as string) || "";
        const rating = (data.get("rating") as string) || "0";
        const badge = (data.get("badge") as string) || "New Release";

        if (!title || !price || !category) {
            return NextResponse.json(
                { error: "title, price and category are required" },
                { status: 400 }
            );
        }

        // Optional media files
        const thumbnailFile = data.get("thumbnail") as File | null;
        const introVideoFile = data.get("videoFile") as File | null;
        const instructorImageFile = data.get("instructorImage") as File | null;

        // Upload optional files in parallel
        const [thumbnailUrl, videoUrl, instructorImageUrl] = await Promise.all([
            thumbnailFile instanceof File && thumbnailFile.size > 0
                ? uploadToCloudinary(thumbnailFile, "image") : Promise.resolve(""),
            introVideoFile instanceof File && introVideoFile.size > 0
                ? uploadToCloudinary(introVideoFile, "video") : Promise.resolve(""),
            instructorImageFile instanceof File && instructorImageFile.size > 0
                ? uploadToCloudinary(instructorImageFile, "image") : Promise.resolve(""),
        ]);

        // Process lectures (each may have its own video file)
        const lectures = await processLectures(data);

        const newCourse = await Course.create({
            title, price: Number(price), category, description,
            instructor,
            instructorImage: instructorImageUrl,
            level, language, hours, rating, badge,
            thumbnail: thumbnailUrl,
            videoUrl: videoUrl,
            lectures,
        });

        return NextResponse.json({
            success: true,
            message: "Course published successfully!",
            course: newCourse,
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ============================================================
// 2. UPDATE COURSE
// ============================================================
export const updateCourse = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const courseExist = await Course.findById(id);
        if (!courseExist) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        const formData = await req.formData();

        // Keep existing values if not replaced
        let thumbnailUrl = courseExist.thumbnail || "";
        let videoUrl = courseExist.videoUrl || "";
        let instructorImgUrl = courseExist.instructorImage || "";

        const newThumb = formData.get("thumbnail");
        if (newThumb instanceof File && newThumb.size > 0)
            thumbnailUrl = await uploadToCloudinary(newThumb, "image");

        const newVideo = formData.get("videoFile");
        if (newVideo instanceof File && newVideo.size > 0)
            videoUrl = await uploadToCloudinary(newVideo, "video");

        const newInstructorImg = formData.get("instructorImage");
        if (newInstructorImg instanceof File && newInstructorImg.size > 0)
            instructorImgUrl = await uploadToCloudinary(newInstructorImg, "image");

        // Process lectures with existing as fallback
        const lectures = await processLectures(formData, courseExist.lectures || []);

        const updatedCourse = await Course.findByIdAndUpdate(id, {
            title: formData.get("title") || courseExist.title,
            price: Number(formData.get("price")) || courseExist.price,
            category: formData.get("category") || courseExist.category,
            description: formData.get("description") ?? courseExist.description,
            instructor: formData.get("instructor") ?? courseExist.instructor,
            instructorImage: instructorImgUrl,
            level: formData.get("level") || courseExist.level,
            language: formData.get("language") || courseExist.language,
            hours: formData.get("hours") ?? courseExist.hours,
            rating: formData.get("rating") ?? courseExist.rating,
            badge: formData.get("badge") || courseExist.badge,
            thumbnail: thumbnailUrl,
            videoUrl: videoUrl,
            lectures,
        }, { new: true });

        return NextResponse.json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse,
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ============================================================
// 3. DELETE COURSE
// ============================================================
export const deleteCourse = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid ID Format" }, { status: 400 });
        }

        const deleted = await Course.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, message: "Course deleted" },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
};

// ============================================================
// 4. GET ALL COURSES
// ============================================================
export const getAllCourses = async () => {
    try {
        await dbConnect();
        const courses = await Course.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, count: courses.length, courses });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ============================================================
// 5. GET SINGLE COURSE
// ============================================================
export const getCourseDetails = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const { id } = await params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: course }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ============================================================
// 6. ENROLL COURSE
// ============================================================
export const enrollCourse = async (req: CourseData) => {
    try {
        await dbConnect();
        const { userId, courseId } = req;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
        }
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });
        }

        const courseExist = await Course.findById(courseId);
        if (!courseExist) {
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });
        }

        const existing = await Enrollment.findOne({ user: userId, course: courseId });
        if (existing) {
            return NextResponse.json({
                success: true, message: "Already enrolled", alreadyEnrolled: true,
            }, { status: 200 });
        }

        const created = await Enrollment.create({
            user: userId, course: courseId, progress: 0,
        });
        const enrolled = await Enrollment.findById(created._id).populate("course").lean();

        return NextResponse.json({ success: true, data: enrolled || [] }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};