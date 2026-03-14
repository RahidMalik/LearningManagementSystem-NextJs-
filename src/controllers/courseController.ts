// src/controllers/courseController.ts
import cloudinary from "@/configs/cloudinary";
import dbConnect from "@/configs/mongodb";
import { Course } from "@/models/Course";
import { Enrollment } from "@/models/Enrollment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Payment } from "@/models/Payment";
import { NextRequest } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import Stripe from "stripe";
import { createNotification } from "./notificationController";
import { User } from "@/models/User";
import { sendCardPaymentSuccessEmail } from "@/lib/emailService";

interface AuthResult {
    success: boolean;
    error?: string;
    status?: number;
    user: { userId: string; email?: string; role?: string; };
}

export interface CourseData {
    userId: string;
    courseId: string;
    accessType?: "half" | "full";
}

// ============================================================
// HELPER: Cloudinary Upload
// ============================================================
const uploadToCloudinary = async (file: File, resourceType: "image" | "video"): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: "LMS_COURSES", resource_type: resourceType },
            (err, result) => {
                if (err) return reject(err);
                resolve(result?.secure_url || "");
            }
        ).end(buffer);
    });
};

// ============================================================
// HELPER: Parse + upload lectures
// ============================================================
const processLectures = async (formData: FormData, existingLectures: any[] = []): Promise<{ title: string; videoUrl: string }[]> => {
    const lecturesRaw = formData.get("lectures") as string | null;
    if (!lecturesRaw) return existingLectures;

    let lecturesMeta: { title: string; videoUrl: string; hasNewVideo: boolean; fileIndex: number; }[] = [];
    try { lecturesMeta = JSON.parse(lecturesRaw); } catch { return existingLectures; }

    const results = await Promise.all(
        lecturesMeta.map(async (meta, index) => {
            const validTitle = meta.title && meta.title.trim() !== "" ? meta.title.trim() : `Lecture ${index + 1}`;
            if (meta.hasNewVideo) {
                const videoFile = formData.get(`lectureVideo_${meta.fileIndex}`) as File | null;
                if (videoFile instanceof File && videoFile.size > 0) {
                    const url = await uploadToCloudinary(videoFile, "video");
                    return { title: validTitle, videoUrl: url };
                }
            }
            return { title: validTitle, videoUrl: meta.videoUrl || "" };
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
            return NextResponse.json({ error: "title, price and category are required" }, { status: 400 });
        }

        const thumbnailFile = data.get("thumbnail") as File | null;
        const introVideoFile = data.get("videoFile") as File | null;
        const instructorImageFile = data.get("instructorImage") as File | null;

        const [thumbnailUrl, videoUrl, instructorImageUrl] = await Promise.all([
            thumbnailFile && thumbnailFile.size > 0 ? uploadToCloudinary(thumbnailFile, "image") : Promise.resolve(""),
            introVideoFile && introVideoFile.size > 0 ? uploadToCloudinary(introVideoFile, "video") : Promise.resolve(""),
            instructorImageFile && instructorImageFile.size > 0 ? uploadToCloudinary(instructorImageFile, "image") : Promise.resolve(""),
        ]);

        const lectures = await processLectures(data);

        const newCourse = await Course.create({
            title, price: Number(price), category, description, instructor,
            instructorImage: instructorImageUrl, level, language, hours, rating, badge,
            thumbnail: thumbnailUrl, videoUrl, lectures,
        });

        return NextResponse.json({ success: true, message: "Course published successfully!", course: newCourse }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Server error", fullError: error }, { status: 500 });
    }
};

// ============================================================
// 2. UPDATE COURSE
// ============================================================
export const updateCourse = async (req: Request, { params }: { params: any }) => {
    try {
        await dbConnect();
        const { id } = await params;
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const courseExist = await Course.findById(id);
        if (!courseExist) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        const formData = await req.formData();
        let thumbnailUrl = courseExist.thumbnail || "";
        let videoUrl = courseExist.videoUrl || "";
        let instructorImgUrl = courseExist.instructorImage || "";

        const newThumb = formData.get("thumbnail");
        if (newThumb instanceof File && newThumb.size > 0) thumbnailUrl = await uploadToCloudinary(newThumb, "image");

        const newVideo = formData.get("videoFile");
        if (newVideo instanceof File && newVideo.size > 0) videoUrl = await uploadToCloudinary(newVideo, "video");

        const newInstructorImg = formData.get("instructorImage");
        if (newInstructorImg instanceof File && newInstructorImg.size > 0) instructorImgUrl = await uploadToCloudinary(newInstructorImg, "image");

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
            thumbnail: thumbnailUrl, videoUrl, lectures,
        }, { new: true });

        return NextResponse.json({ success: true, message: "Course updated successfully", course: updatedCourse }, { status: 200 });
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
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid ID Format" }, { status: 400 });

        const deleted = await Course.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Course deleted" }, { status: 200 });
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
        if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const course = await Course.findById(id);
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

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
        const { userId, courseId, accessType = "full" } = req;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId))
            return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const courseExist = await Course.findById(courseId).lean() as any;
        if (!courseExist)
            return NextResponse.json({ error: "Course Not Found" }, { status: 404 });

        const [studentDoc, adminDoc] = await Promise.all([
            User.findById(userId).select("name email").lean() as any,
            User.findOne({ role: "admin" }).select("_id").lean() as any,
        ]);

        const courseTitle = courseExist.title || "the course";
        const studentName = studentDoc?.name || "A student";
        const studentEmail = studentDoc?.email || "";
        const accessText = accessType === "half" ? "50% Half Access" : "Full Access";

        const existing = await Enrollment.findOne({ user: userId, course: courseId });

        // ── UPGRADE: half → full ──
        if (existing) {
            if (existing.accessType === "half" && accessType === "full") {
                await Enrollment.updateOne({ _id: existing._id }, { $set: { accessType: "full" } });

                // Card email — upgrade
                if (studentEmail) {
                    await sendCardPaymentSuccessEmail({
                        toEmail: studentEmail,
                        userName: studentName,
                        courseName: courseTitle,
                        amount: courseExist.price,
                        accessType: "full",
                    }).catch(e => console.error("Card upgrade email failed:", e));
                }

                // Student notification
                await createNotification({
                    userId, type: "enrollment",
                    title: "⬆️ Upgrade Successful!",
                    message: `You upgraded to Full Access for "${courseTitle}" via Card. All videos unlocked! 🎉`,
                    meta: { courseId },
                });
                // Admin notification
                if (adminDoc) await createNotification({
                    userId: adminDoc._id.toString(), type: "new_student",
                    title: `⬆️ Upgrade — ${courseTitle}`,
                    message: `${studentName} (${studentEmail}) upgraded to Full Access for "${courseTitle}" via Card.`,
                    meta: { courseId, studentId: userId },
                });

                return NextResponse.json({
                    success: true, message: "Access upgraded to full!",
                    upgraded: true, accessType: "full",
                }, { status: 200 });
            }

            return NextResponse.json({
                success: true, message: "Already enrolled", alreadyEnrolled: true,
            }, { status: 200 });
        }

        // ── FRESH ENROLLMENT ──
        const created = await Enrollment.create({ user: userId, course: courseId, progress: 0, accessType });
        const enrolled = await Enrollment.findById(created._id).populate("course").lean();

        //  Card email — fresh enrollment
        if (studentEmail) {
            await sendCardPaymentSuccessEmail({
                toEmail: studentEmail,
                userName: studentName,
                courseName: courseTitle,
                amount: courseExist.price,
                accessType,
            }).catch(e => console.error("Card enrollment email failed:", e));
        }

        // Student notification
        await createNotification({
            userId, type: "enrollment",
            title: "🎉 Enrollment Successful! (Card)",
            message: `You enrolled in "${courseTitle}" via Card. ${accessType === "half" ? "First 50% unlocked." : "All content unlocked. Happy learning!"}`,
            meta: { courseId },
        });
        // Admin notification
        if (adminDoc) await createNotification({
            userId: adminDoc._id.toString(), type: "new_student",
            title: `💳 New Card Enrollment — ${courseTitle}`,
            message: `${studentName} (${studentEmail}) enrolled in "${courseTitle}" via Card. Access: ${accessText}.`,
            meta: { courseId, studentId: userId },
        });

        return NextResponse.json({ success: true, data: enrolled || [] }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
// ─────────────────────────────────────────────
// CREATE PAYMENT INTENT
// ─────────────────────────────────────────────
export async function PaymentIntentCreate(request: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });

        const { courseId, accessType = "full" } = await request.json();
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const existingEnrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });

        if (existingEnrollment) {
            if (existingEnrollment.accessType === "half" && accessType === "full") {
                // ✅ Upgrade allowed — continue
                console.log("Half → Full upgrade requested");
            } else {
                // Already fully enrolled
                return NextResponse.json({ success: false, error: "You are already enrolled in this course.", alreadyEnrolled: true }, { status: 400 });
            }
        }

        const course = await Course.findById(courseId);
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

        const discount = course.discount || 0;
        const fullPrice = Math.round(course.price - (course.price * discount) / 100);

        // ✅ CHARGE LOGIC
        // Case 1: Upgrade (half→full) — charge ONLY remaining half
        // Case 2: New half enrollment  — charge first half
        // Case 3: New full enrollment  — charge full price
        let chargeAmount: number;
        const isUpgradeFlow = existingEnrollment?.accessType === "half";

        if (isUpgradeFlow) {
            // User already paid half → remaining half only
            chargeAmount = Math.round(fullPrice / 2);
            console.log(`🔄 Upgrade flow: charging remaining half = ${chargeAmount}`);
        } else if (accessType === "half") {
            chargeAmount = Math.round(fullPrice / 2);
            console.log(`💳 New half enrollment: charging = ${chargeAmount}`);
        } else {
            chargeAmount = fullPrice;
            console.log(`💳 New full enrollment: charging = ${chargeAmount}`);
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: chargeAmount * 100,
            currency: "pkr",
            metadata: { courseId, userId: auth.user.userId, courseName: course.title, accessType },
        });

        return NextResponse.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            amount: chargeAmount,  // ← frontend pe yahi dikhega (remaining half)
            fullAmount: fullPrice,
            accessType,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// ENROLL IN COURSE (Frontend Direct Call)
// ─────────────────────────────────────────────
export async function EnrollInCourse(request: NextRequest) {
    try {
        await dbConnect();
        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ error: auth.error }, { status: 401 });

        const { courseId, accessType = "full" } = await request.json();
        if (!courseId || !mongoose.Types.ObjectId.isValid(courseId))
            return NextResponse.json({ error: "Invalid Course ID" }, { status: 400 });

        const existingEnrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });
        if (existingEnrollment) {
            if (existingEnrollment.accessType === "half" && accessType === "full") {
                await Enrollment.updateOne({ _id: existingEnrollment._id }, { $set: { accessType: "full" } });
                return NextResponse.json({ success: true, upgraded: true, accessType: "full", message: "Access upgraded to full!" });
            }
            return NextResponse.json({ success: false, error: "Already enrolled" }, { status: 400 });
        }

        const enrollment = await Enrollment.create({
            user: auth.user.userId, course: courseId,
            accessType, status: "active", progress: 0,
        });

        return NextResponse.json({ success: true, enrollment, accessType });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function CheckEnrollment(request: NextRequest) {
    try {
        await dbConnect();

        const authHeader = request.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const auth = await validateRequest(request) as AuthResult;
        if (!auth.success) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const url = new URL(request.url);
        const courseId = url.searchParams.get("courseId");
        if (!courseId) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const enrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });
        if (!enrollment) return NextResponse.json({ isEnrolled: false, accessType: null, paymentMethod: null });

        const walletPayment = await Payment.findOne({ user: auth.user.userId, course: courseId });
        const paymentMethod = walletPayment ? "wallet" : "card";

        return NextResponse.json({
            isEnrolled: true,
            accessType: enrollment.accessType ?? null,
            paymentMethod,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
// ─────────────────────────────────────────────
// ADMIN REVENUE
// ─────────────────────────────────────────────
export const getAdminRevenue = async (req: Request) => {
    try {
        await dbConnect();
        const authResult = await validateRequest(req);
        if (!authResult.success || !authResult.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const walletPayments = await Payment.find({ status: "approved" });
        const walletRevenue = walletPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);
        const walletPairs = walletPayments.map((p: any) => `${p.user?.toString()}_${p.course?.toString()}`);

        const allEnrollments = await Enrollment.find({ status: "active" }).populate("course", "price");
        const stripeEnrollments = allEnrollments.filter((e: any) => !walletPairs.includes(`${e.user?.toString()}_${e.course?.toString()}`));

        const stripeRevenue = stripeEnrollments.reduce((sum: number, e: any) => {
            const price = Number(e.course?.price) || 0;
            return sum + (e.accessType === "half" ? Math.round(price / 2) : price);
        }, 0);

        return NextResponse.json({
            success: true, totalRevenue: walletRevenue + stripeRevenue,
            breakdown: { wallet: walletRevenue, stripe: stripeRevenue, walletCount: walletPayments.length, stripeCount: stripeEnrollments.length },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};

// ─────────────────────────────────────────────
// COURSES STATE
// ─────────────────────────────────────────────
export const getCoursesState = async (req: Request) => {
    try {
        await dbConnect();
        const authResult = await validateRequest(req);
        if (!authResult.success || !authResult.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const enrollments = await Enrollment.find({ status: "active" }).populate("course", "price title");
        const walletPayments = await Payment.find({ status: "approved" }).lean();
        const walletPairs = walletPayments.map((p: any) => `${p.user?.toString()}_${p.course?.toString()}`);

        const stateMap: Record<string, { students: number; revenue: number }> = {};

        enrollments.forEach((e: any) => {
            const courseId = e.course?._id?.toString();
            if (!courseId) return;
            if (!stateMap[courseId]) stateMap[courseId] = { students: 0, revenue: 0 };
            stateMap[courseId].students += 1;

            const pair = `${e.user?.toString()}_${courseId}`;
            if (!walletPairs.includes(pair)) {
                const price = Number(e.course?.price) || 0;
                stateMap[courseId].revenue += e.accessType === "half" ? Math.round(price / 2) : price;
            }
        });

        walletPayments.forEach((p: any) => {
            const courseId = p.course?.toString();
            if (!courseId) return;
            if (!stateMap[courseId]) stateMap[courseId] = { students: 0, revenue: 0 };
            stateMap[courseId].revenue += Number(p.amount) || 0;
        });

        return NextResponse.json({ success: true, stats: stateMap });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
};