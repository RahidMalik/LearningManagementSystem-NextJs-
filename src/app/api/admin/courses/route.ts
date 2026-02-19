import { createCourse, getAllCourses } from "@/controllers/courseController";

export async function POST(req: Request) {
    return createCourse(req);
}

export async function GET() {
    return getAllCourses();
}