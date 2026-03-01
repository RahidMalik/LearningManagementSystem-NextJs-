import { NextResponse } from "next/server";
import dbConnect from "@/configs/mongodb";
import { WalletVerification } from "@/controllers/paymentsController";

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();


        const result = await WalletVerification(body);

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}