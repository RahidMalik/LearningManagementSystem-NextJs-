
// ── app/api/admin/payments/approve/route.ts ──
import { NextRequest } from "next/server";
import { ApproveWalletPayment } from "@/controllers/paymentsController";
export async function POST(req: NextRequest) {
    return ApproveWalletPayment(req);
}