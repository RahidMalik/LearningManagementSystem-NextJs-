import { Login } from "@/controllers/authController";

export async function POST(req: Request) {
    return Login(req);
}