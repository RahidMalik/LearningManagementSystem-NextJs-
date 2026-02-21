import { verifyToken } from "@/lib/jwt";

export async function validateRequest(req: Request) {
    try {
        // 1. GEt header token from bearer
        const authheader = req.headers.get("authorization");

        if (!authheader || !authheader.startsWith("Bearer")) {
            return { error: "Access Denied. No token provider", status: 400 };
        }

        const token = authheader.split(" ")[1];

        //2. token verify
        const decoded = verifyToken(token)

        if (!decoded) {
            return { error: "Invalid or expired token.", status: 401 };
        }
        // 3. if all right then return decoded data
        return { user: decoded, status: 200 };

    } catch (error) {
        return { error: "Authentication failed.", status: 401 };
    }
}