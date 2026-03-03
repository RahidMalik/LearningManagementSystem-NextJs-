// src/app/api/admin/courses/[id]/route.ts
import { updateCourse, deleteCourse } from "@/controllers/courseController";
import { NextRequest } from "next/server";

export const maxDuration = 60;

export async function PUT(req: NextRequest, context: { params: any }) {
    return await updateCourse(req, context);
}

export async function DELETE(req: NextRequest, context: { params: any }) {
    return await deleteCourse(req, context);
}