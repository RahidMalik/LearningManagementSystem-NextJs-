// src/app/api/courses/[id]/reviews/route.ts

import { NextRequest } from "next/server";
import { submitReview, getCourseReviews, deleteOwnReview } from "@/controllers/reviewController";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return getCourseReviews(req, id);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return submitReview(req, id);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return deleteOwnReview(req, id);
}