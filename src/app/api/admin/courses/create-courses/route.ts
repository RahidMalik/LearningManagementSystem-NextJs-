// src/app/api/admin/courses/create-courses/route.ts
import { createCourse } from "@/controllers/courseController";
import { NextRequest } from "next/server";

export const maxDuration = 300;

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    return await createCourse(req);
}