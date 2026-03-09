// ── app/api/admin/payments/route.ts ──
import { NextRequest } from "next/server";
import { GetAdminWalletPayments } from "@/controllers/paymentsController";
export async function GET(req: NextRequest) {
    return GetAdminWalletPayments(req);
}