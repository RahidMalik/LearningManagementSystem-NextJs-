// src/app/api/admin/reviews/route.ts

import { NextRequest } from "next/server";
import { getAllReviews, deleteReview } from "@/controllers/reviewController";

export async function GET(req: NextRequest) {
    return getAllReviews(req);
}

export async function DELETE(req: NextRequest) {
    return deleteReview(req);
}