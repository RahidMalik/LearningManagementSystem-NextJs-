import { updateProfile } from "@/controllers/authController";

export async function PUT(req: Request) {
    return updateProfile(req);
}