import { updateCourse, deleteCourse } from "@/controllers/courseController";
import dbConnect from "@/configs/mongodb"

export async function PUT(req: Request, context: any) {
    await dbConnect();
    return updateCourse(req, context);
}

export async function DELETE(req: Request, context: any) {
    await dbConnect();
    return deleteCourse(req, context);
}