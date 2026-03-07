import { toggleStudentAccess } from "@/controllers/studentController";
import { NextResponse } from "next/server";
export async function PUT(req: Request): Promise<NextResponse> {
    return toggleStudentAccess(req);
}