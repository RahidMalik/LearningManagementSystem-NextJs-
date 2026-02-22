import { UpdateProfilePhoto } from "@/controllers/authController"

export async function POST(req: Request) {
    return UpdateProfilePhoto(req);
};