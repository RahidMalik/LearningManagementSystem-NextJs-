import { NextRequest } from "next/server";
import { RejectWalletPayment } from "@/controllers/paymentsController";
export async function POST(req: NextRequest) {
    return RejectWalletPayment(req);
}