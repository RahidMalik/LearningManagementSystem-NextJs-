import { verifyToken } from "@/lib/jwt";

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

        return { success: true, user: decoded, status: 200 };

    } catch (error) {
        return { error: "Authentication failed.", status: 401 };
    }
};

export default validateRequest;