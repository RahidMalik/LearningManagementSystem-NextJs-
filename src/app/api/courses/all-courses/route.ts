import { getAllCourses } from "@/controllers/courseController";


export async function GET() {
    return await getAllCourses();
}