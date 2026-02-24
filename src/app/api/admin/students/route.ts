import { getAllStudents } from "@/controllers/studentController";

export async function GET(req: Request) {
    return getAllStudents(req);
}