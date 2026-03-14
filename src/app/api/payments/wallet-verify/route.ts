import { WalletVerification } from "@/controllers/paymentsController";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    return await WalletVerification(request)
}
