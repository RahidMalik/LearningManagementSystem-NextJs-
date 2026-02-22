import { verifyToken } from "@/lib/jwt";

// Add this interface definition
interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}

// Update your validateRequest function to use proper typing
 const validateRequest = async (req: Request) => {
    try {
        const authheader = req.headers.get("authorization");

        if (!authheader || !authheader.startsWith("Bearer")) {
            return { error: "Access Denied. No token provider", status: 400 };
        }

        const token = authheader.split(" ")[1];
        const decoded = verifyToken(token) as TokenPayload | null;

        if (!decoded) {
            return { error: "Invalid or expired token.", status: 401 };
        }

        // TypeScript now knows decoded has userId and email
        return { success: true, user: decoded, status: 200 };

    } catch (error) {
        return { error: "Authentication failed.", status: 401 };
    }
};

export default validateRequest;