import { NextResponse } from "next/server";
import validateRequest from "@/middleware/authMiddleware";

export const adminGuard = async (req: Request) => {
  try {
    // 1. validateRequest se auth check
    const auth = await validateRequest(req);

    // 2. Auth fail check
    if (!auth.success || !auth.user) {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Unauthorized! Please login." },
          { status: 401 }
        )
      };
    }

    // 3. Role check — token mein role already hai
    if (auth.user.role !== "admin") {
      return {
        success: false,
        response: NextResponse.json(
          { success: false, error: "Forbidden! You are not an admin." },
          { status: 403 }
        )
      };
    }

    // 4. Success
    return {
      success: true,
      userId: auth.user.userId,
      user: auth.user,
    };

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