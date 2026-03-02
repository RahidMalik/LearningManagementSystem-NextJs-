import { PaymentIntentCreate } from "@/controllers/paymentsController";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    return await PaymentIntentCreate(req)
}       