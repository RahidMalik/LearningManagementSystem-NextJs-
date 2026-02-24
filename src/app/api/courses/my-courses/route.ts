import { getMyEnrolledCourses } from "@/controllers/courseController";

interface Request {
    userId: string;
}
export async function GET(request: Request) {
    return getMyEnrolledCourses(request);
}