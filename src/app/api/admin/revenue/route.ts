import { getAdminRevenue } from "@/controllers/paymentsController";

export async function GET(req: Request) {
    return getAdminRevenue(req);
}