import { syncFirebaseUser } from "@/controllers/authController";

export async function POST(req: Request) {
    return syncFirebaseUser(req);
}