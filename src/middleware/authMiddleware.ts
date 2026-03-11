import { verifyToken } from "@/lib/jwt";
import { User } from "@/models/User";
import dbconnect from "@/configs/mongodb";

interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

const validateRequest = async (req: Request) => {
    try {
        const authHeader = req.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { error: "Access Denied. No token provided", status: 401 };
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token) as TokenPayload | null;

        if (!decoded) {
            return { error: "Invalid or expired token.", status: 401 };
        }

        await dbconnect();

        const user = await User.findById(decoded.userId).select("role");

        if (!user) {
            return { error: "User not found.", status: 404 };
        }

        return { success: true, user: decoded, status: 200 };

    } catch (error) {
        return { error: "Authentication failed.", status: 401 };
    }
};

export default validateRequest;