import { getMe } from "@/controllers/authController";

export async function GET(req: Request) {
    return getMe(req);
}