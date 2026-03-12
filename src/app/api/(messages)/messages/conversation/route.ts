import { getConversations } from "@/controllers/messageController";

export async function GET(req: Request) {
    return getConversations(req as any);
}