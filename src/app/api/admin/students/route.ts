import { getAllStudents } from "@/controllers/studentController";
export async function GET() {
    return getAllStudents();
}