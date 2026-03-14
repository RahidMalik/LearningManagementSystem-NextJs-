import { NextRequest } from "next/server";
import validateRequest from "@/middleware/authMiddleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const globalForSSE = global as unknown as { sseClients: Map<string, Set<ReadableStreamDefaultController>> };
const clients = globalForSSE.sseClients || new Map();
if (process.env.NODE_ENV !== "production") globalForSSE.sseClients = clients;

// ─────────────────────────────────────────────
// INTERNAL HELPER — push live data
// ─────────────────────────────────────────────
export function pushNotificationToUser(userId: string, notification: object) {
    const userClients = clients.get(userId);
    if (!userClients || userClients.size === 0) {
        console.log(`⚠️ SSE: user ${userId} offline`);
        return;
    }
    const payload = `data: ${JSON.stringify(notification)}\n\n`;
    const encoded = new TextEncoder().encode(payload);
    for (const controller of userClients) {
        try {
            controller.enqueue(encoded);
        } catch {
            userClients.delete(controller);
        }
    }
    console.log(`📨 SSE pushed to ${userId} (${userClients.size} tab/s)`);
}

// ─────────────────────────────────────────────
// GET /api/notifications/stream
// ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");
    const headers = new Headers(request.headers);
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    const reqWithAuth = new NextRequest(request.url, {
        headers,
        method: request.method,
    });

    const auth = await validateRequest(reqWithAuth) as any;
    if (!auth.success) return new Response("Unauthorized", { status: 401 });

    const userId = auth.user.userId.toString();

    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;

            // Register
            if (!clients.has(userId)) clients.set(userId, new Set());
            clients.get(userId)!.add(controller);
            console.log(`✅ SSE open: ${userId}`);

            // Keep-alive ping har 25s
            const ping = setInterval(() => {
                try {
                    controller.enqueue(new TextEncoder().encode(`: keep-alive\n\n`));
                } catch {
                    clearInterval(ping);
                }
            }, 25000);

            // Disconnect cleanup
            request.signal.addEventListener("abort", () => {
                clearInterval(ping);
                clients.get(userId)?.delete(controller);
                if (clients.get(userId)?.size === 0) clients.delete(userId);
                console.log(`❌ SSE closed: ${userId}`);
                try { controller.close(); } catch { }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}