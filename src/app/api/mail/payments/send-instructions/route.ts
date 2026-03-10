import { NextRequest } from "next/server";
import { sendWalletInstructionsEmail } from "@/lib/sendinstruction";


export async function POST(request: NextRequest) {
    return await sendWalletInstructionsEmail(request);
}