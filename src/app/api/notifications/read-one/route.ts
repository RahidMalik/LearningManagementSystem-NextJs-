import { ReadOne } from "@/controllers/notificationController";
import { NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
    return await ReadOne(request);
}