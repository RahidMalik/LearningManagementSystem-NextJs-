import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/configs/mongodb";
import validateRequest from "@/middleware/authMiddleware";
import { Review } from "@/models/Review";
import { Enrollment } from "@/models/Enrollment";

// ─────────────────────────────────────────────
// POST /api/courses/[id]/reviews  — Submit review
// ─────────────────────────────────────────────
export async function submitReview(request: NextRequest, courseId: string) {
    try {
        await dbConnect();

        const auth = await validateRequest(request) as any;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { rating, comment } = await request.json();

        if (!rating || rating < 1 || rating > 5)
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });

        if (!comment?.trim())
            return NextResponse.json({ error: "Review comment is required" }, { status: 400 });

        // Only enrolled students can review
        const enrollment = await Enrollment.findOne({ user: auth.user.userId, course: courseId });
        if (!enrollment)
            return NextResponse.json({ error: "You must be enrolled to leave a review" }, { status: 403 });

        // Upsert — update if already reviewed
        const review = await Review.findOneAndUpdate(
            { course: courseId, user: auth.user.userId },
            { rating, comment: comment.trim() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        const populated = await review.populate("user", "name photoURL");

        return NextResponse.json({ success: true, review: populated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// GET /api/courses/[id]/reviews  — Get all reviews
// ─────────────────────────────────────────────
export async function getCourseReviews(request: NextRequest, courseId: string) {
    try {
        await dbConnect();

        const reviews = await Review.find({ course: courseId })
            .populate("user", "name photoURL")
            .sort({ createdAt: -1 })
            .lean();

        const avgRating = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({
            success: true,
            reviews,
            avgRating: Math.round(avgRating),
            totalReviews: reviews.length,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}// ─────────────────────────────────────────────
// GET all reviews — Admin (No Pagination)
// ─────────────────────────────────────────────
export async function getAllReviews(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reviews = await Review.find({})
            .populate("user", "name photoURL")
            .populate("course", "title thumbnail")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            reviews,
            total: reviews.length
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// ─────────────────────────────────────────────
// DELETE own review — logged in user
// ─────────────────────────────────────────────
export async function deleteOwnReview(request: NextRequest, courseId: string) {
    try {
        await dbConnect();

        const auth = await validateRequest(request) as any;
        if (!auth.success) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const reviewId = url.searchParams.get("reviewId");
        if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

        // Only delete if belongs to this user
        const deleted = await Review.findOneAndDelete({ _id: reviewId, user: auth.user.userId });
        if (!deleted) return NextResponse.json({ error: "Review not found" }, { status: 404 });

        return NextResponse.json({ success: true, message: "Review deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
export async function deleteReview(request: NextRequest) {
    try {
        await dbConnect();

        const auth = await validateRequest(request) as any;
        if (!auth.success || auth.user?.role !== "admin")
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const reviewId = url.searchParams.get("reviewId");
        if (!reviewId) return NextResponse.json({ error: "reviewId required" }, { status: 400 });

        await Review.findByIdAndDelete(reviewId);
        return NextResponse.json({ success: true, message: "Review deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}