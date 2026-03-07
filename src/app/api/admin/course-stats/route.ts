import { getCoursesState } from "@/controllers/paymentsController";

export async function GET(req: Request) {
    return getCoursesState(req);
}