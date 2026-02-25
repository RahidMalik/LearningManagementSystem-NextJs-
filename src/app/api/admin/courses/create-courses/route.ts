import { createCourse } from "@/controllers/courseController";


export async function POST(req: Request) {
    return await createCourse(req);
}