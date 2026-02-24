"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Loader2,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api"; // Aapki API service file
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Socket instance
let socket: Socket;

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- 1. Static User ID (Isay aap apne Auth context se replace karein) ---
  const currentUserId = "65ba1234567890abcdef1234";

  // --- 2. Initialize Socket & Fetch Chats ---
  useEffect(() => {
    // Socket connect karein (Backend URL yahan aayega)
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

    const initChats = async () => {
      try {
        const res = await api.getConversations(); // GET /api/conversations
        if (res.success) setConversations(res.data);
      } catch (err) {
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    initChats();

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- 3. Socket Listeners for Real-time ---
  useEffect(() => {
    if (!socket) return;

    socket.on("messageReceived", (incomingMsg) => {
      // Agar ye message usi chat ka hai jo open hai
      if (activeChat && incomingMsg.conversationId === activeChat._id) {
        setMessages((prev) => [...prev, incomingMsg]);
      }

      // Sidebar ki last message update karein
      setConversations((prev) =>
        prev.map((c) =>
          c._id === incomingMsg.conversationId
            ? { ...c, lastMessage: incomingMsg.text }
            : c,
        ),
      );
    });

    return () => {
      socket.off("messageReceived");
    };
  }, [activeChat]);

  // --- 4. Load Messages on Chat Switch ---
  useEffect(() => {
    if (activeChat) {
      const loadMessages = async () => {
        try {
          const res = await api.getMessages(activeChat._id); // GET /api/messages?convId=...
          setMessages(res.data);
          socket.emit("joinRoom", activeChat._id); // Socket room join karein
        } catch (err) {
          toast.error("Could not load messages");
        }
      };
      loadMessages();
    }
  }, [activeChat]);

  // --- 5. Auto Scroll to Bottom ---
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 6. Send Message Logic ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || isSending) return;

    setIsSending(true);
    const receiverId = activeChat.participants.find(
      (p: any) => p._id !== currentUserId,
    )._id;

    const payload = {
      senderId: currentUserId,
      receiverId: receiverId,
      text: newMessage,
      conversationId: activeChat._id,
    };

    try {
      const res = await api.sendMessage(payload); // POST /api/messages
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        socket.emit("newMessage", res.data); // Emit to other user
        setNewMessage("");
      }
    } catch (err) {
      toast.error("Message not sent");
    } finally {
      setIsSending(false);
    }
  };

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={40} />
        <p className="text-slate-500 font-medium">
          Loading your conversations...
        </p>
      </div>
    );

  return (
    <div className="container mx-auto h-[calc(100vh-120px)] flex overflow-hidden bg-white border rounded-[2rem] shadow-2xl my-4">
      {/* --- Sidebar: Contacts --- */}
      <div className="w-full md:w-96 border-r flex flex-col bg-slate-50/50">
        <div className="p-6 bg-white border-b">
          <h2 className="text-2xl font-black text-[#0a348f] mb-4">Messages</h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="Search chats..."
              className="pl-10 rounded-2xl bg-slate-100 border-none h-12"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {conversations.length > 0 ? (
            conversations.map((chat) => {
              const otherUser = chat.participants.find(
                (p: any) => p._id !== currentUserId,
              );
              return (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-center gap-4 p-5 cursor-pointer transition-all border-b border-slate-100/50 ${
                    activeChat?._id === chat._id
                      ? "bg-white shadow-md z-10 scale-[1.02] border-l-4 border-l-[#0a348f]"
                      : "hover:bg-slate-100/50"
                  }`}
                >
                  <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-[#0a348f] font-bold text-xl border-2 border-white shadow-sm">
                    {otherUser?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-800 truncate">
                        {otherUser?.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        12:40 PM
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-10 text-center text-slate-400">
              No conversations yet
            </div>
          )}
        </div>
      </div>

      {/* --- Main Chat Window --- */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-5 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-[#0a348f] text-white flex items-center justify-center font-bold shadow-lg">
                  {activeChat.participants
                    .find((p: any) => p._id !== currentUserId)
                    ?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {
                      activeChat.participants.find(
                        (p: any) => p._id !== currentUserId,
                      )?.name
                    }
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-400"
              >
                <MoreVertical size={20} />
              </Button>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8fafc]">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg._id}
                    className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[65%] p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed ${
                        msg.senderId === currentUserId
                          ? "bg-[#0a348f] text-white rounded-tr-none shadow-blue-200"
                          : "bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-slate-200"
                      }`}
                    >
                      {msg.text}
                      <p
                        className={`text-[9px] mt-2 font-bold opacity-60 ${msg.senderId === currentUserId ? "text-right" : "text-left"}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={scrollRef} />
            </div>

            {/* Input Form */}
            <div className="p-6 bg-white border-t">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-200 focus-within:border-[#0a348f] focus-within:bg-white transition-all shadow-inner"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-[#0a348f] rounded-xl"
                >
                  <Paperclip size={20} />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="border-none bg-transparent focus-visible:ring-0 text-slate-700 h-12"
                />
                <Button
                  disabled={!newMessage.trim() || isSending}
                  className="bg-[#0a348f] hover:bg-[#0d2a6b] rounded-xl h-12 px-6 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50/30">
            <div className="p-6 bg-white rounded-full shadow-xl shadow-slate-100">
              <User size={60} />
            </div>
            <p className="font-bold text-lg text-slate-400">
              Select a contact to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
