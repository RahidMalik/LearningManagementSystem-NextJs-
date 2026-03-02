import { NextRequest, NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";
import cloudinary from "@/configs/cloudinary";

export async function POST(request: NextRequest) {
    try {
        const auth = await validateRequest(request);
        if (!auth.success) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // File size check (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
        }

        // Cloudinary upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "LMS_WALLET_RECEIPTS", resource_type: "image" },
                (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}