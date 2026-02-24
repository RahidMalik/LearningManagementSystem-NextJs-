import { NextResponse } from "next/server";
import dbconnect from "@/configs/mongodb";
import { User } from "@/models/User";
import validateRequest from "@/middleware/authMiddleware";

export const adminGuard = async (req: Request) => {
    try {
        await dbconnect();

        const userId = await validateRequest(req);

        if (!userId) {
            return {
                success: false,
                response: NextResponse.json(
                    { success: false, error: "Unauthorized! Please login." },
                    { status: 401 }
                )
            };
        }

        const user = await User.findById(userId).select("role");

        if (!user || user.role !== "admin") {
            return {
                success: false,
                response: NextResponse.json(
                    { success: false, error: "Forbidden! You are not an admin." },
                    { status: 403 }
                )
            };
        }

        return { success: true, userId: user._id };

    } catch (error: any) {
        return {
            success: false,
            response: NextResponse.json(
                { success: false, error: "Admin Check Error: " + error.message },
                { status: 500 }
            )
        };
    }
};