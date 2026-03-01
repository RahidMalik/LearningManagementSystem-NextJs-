import { PaymentIntentWebhook } from "@/controllers/paymentsController";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    return await PaymentIntentWebhook(req)
}

export const config = {
    api: { bodyParser: false },
};