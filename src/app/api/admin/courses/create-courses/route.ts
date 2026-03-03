// src/app/api/admin/courses/create-courses/route.ts
import { createCourse } from "@/controllers/courseController";
import { NextRequest } from "next/server";

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
};

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    return await createCourse(req);
}