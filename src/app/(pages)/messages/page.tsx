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
import { api } from "@/services/api";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

let socket: Socket;

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = "65ba1234567890abcdef1234";

  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000");

    const initChats = async () => {
      try {
        const res = await api.getConversations();
        if (res.success) setConversations(res.data ?? []);
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

  useEffect(() => {
    if (!socket) return;

    socket.on("messageReceived", (incomingMsg) => {
      if (activeChat && incomingMsg.conversationId === activeChat._id) {
        setMessages((prev) => [...prev, incomingMsg]);
      }

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

  useEffect(() => {
    if (activeChat) {
      const loadMessages = async () => {
        try {
          const res = await api.getMessages(activeChat._id);
          setMessages(res.data ?? []);
          socket.emit("joinRoom", activeChat._id);
        } catch (err) {
          toast.error("Could not load messages");
        }
      };
      loadMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      const res = await api.sendMessage(payload);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        socket.emit("newMessage", res.data);
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
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400"
          size={40}
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading your conversations...
        </p>
      </div>
    );

  return (
    // Main Wrapper
    <div className="p-4 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-300">
      <div className="container mx-auto h-[calc(100vh-140px)] flex overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] shadow-xl dark:shadow-none transition-colors duration-300">
        {/* --- Sidebar: Contacts --- */}
        <div
          className={`w-full md:w-96 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300 ${activeChat ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
            <h2 className="text-2xl font-black text-[#0a348f] dark:text-blue-400 mb-4 transition-colors">
              Messages
            </h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors"
                size={18}
              />
              <Input
                placeholder="Search chats..."
                className="pl-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none h-12 text-slate-900 dark:text-slate-100 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors duration-300"
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
                    className={`flex items-center gap-4 p-5 cursor-pointer transition-all border-b border-slate-100/50 dark:border-slate-700/50 ${
                      activeChat?._id === chat._id
                        ? "bg-white dark:bg-slate-800 shadow-md z-10 scale-[1.02] border-l-4 border-l-[#0a348f] dark:border-l-blue-500"
                        : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0a348f] dark:text-blue-400 font-bold text-xl border-2 border-white dark:border-slate-800 shadow-sm transition-colors">
                      {otherUser?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate transition-colors">
                          {otherUser?.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          12:40 PM
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5 transition-colors">
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-slate-400 dark:text-slate-500">
                No conversations yet
              </div>
            )}
          </div>
        </div>

        {/* --- Main Chat Window --- */}
        <div
          className={`flex-1 flex-col bg-white dark:bg-slate-800 transition-colors duration-300 ${!activeChat ? "hidden md:flex" : "flex"}`}
        >
          {activeChat ? (
            <>
              {/* Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-300">
                <div className="flex items-center gap-4">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setActiveChat(null)}
                    className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <div className="h-12 w-12 rounded-full bg-[#0a348f] dark:bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg transition-colors">
                    {activeChat.participants
                      .find((p: any) => p._id !== currentUserId)
                      ?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg transition-colors">
                      {
                        activeChat.participants.find(
                          (p: any) => p._id !== currentUserId,
                        )?.name
                      }
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <MoreVertical size={20} />
                </Button>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-[#f8fafc] dark:bg-slate-900 transition-colors duration-300">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      key={msg._id}
                      className={`flex ${msg.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] md:max-w-[65%] p-4 rounded-[1.5rem] shadow-sm text-sm leading-relaxed transition-colors ${
                          msg.senderId === currentUserId
                            ? "bg-[#0a348f] dark:bg-blue-600 text-white rounded-tr-none shadow-blue-200 dark:shadow-none"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-slate-200 dark:shadow-none"
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
              <div className="p-4 md:p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 transition-colors duration-300">
                <form
                  onSubmit={handleSendMessage}
                  className="flex items-center gap-2 md:gap-3 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-[#0a348f] dark:focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner dark:shadow-none"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-xl"
                  >
                    <Paperclip size={20} />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="border-none bg-transparent focus-visible:ring-0 text-slate-700 dark:text-slate-200 h-12 w-full"
                  />
                  <Button
                    disabled={!newMessage.trim() || isSending}
                    className="bg-[#0a348f] dark:bg-blue-600 hover:bg-[#0d2a6b] dark:hover:bg-blue-700 rounded-xl h-12 px-4 md:px-6 shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 transition-all text-white"
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
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 gap-4 bg-slate-50/30 dark:bg-slate-900/30 transition-colors duration-300">
              <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-xl shadow-slate-100 dark:shadow-none transition-colors">
                <User size={60} className="dark:text-slate-500" />
              </div>
              <p className="font-bold text-lg text-slate-400 dark:text-slate-500">
                Select a contact to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
