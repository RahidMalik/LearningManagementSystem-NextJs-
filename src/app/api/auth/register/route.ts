import { registerUser } from "@/controllers/authController";

export async function POST(req: Request) {
    return registerUser(req);
};