import { getCourseDetails } from "@/controllers/courseController";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    return await getCourseDetails(req, { params: resolvedParams });
}