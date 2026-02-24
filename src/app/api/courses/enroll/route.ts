import { enrollCourse } from "@/controllers/courseController";
interface Request {
    userId: string;
    courseId: string;
}
export async function POST(req: Request) {
    return enrollCourse(req);
}