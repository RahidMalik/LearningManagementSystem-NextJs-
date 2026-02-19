import { updateCourse, deleteCourse } from "@/controllers/courseController";


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    return updateCourse(req, params.id);
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    return deleteCourse(params.id);
}