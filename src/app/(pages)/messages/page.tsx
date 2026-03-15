"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Loader2,
  User,
  ChevronLeft,
  ShieldCheck,
  Check,
  CheckCheck,
  Pencil,
  Trash2,
  X,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/services/api";
import { io, Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

let socket: Socket;

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // States for features
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [onlineUsersList, setOnlineUsersList] = useState<string[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Init ──────────────────────────────────────────
  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

    const initData = async () => {
      try {
        const profileRes = (await api.getProfile()) as any;
        const userData =
          profileRes?.data?.user ?? profileRes?.user ?? profileRes?.data;
        if (!userData) return;
        setCurrentUser(userData);

        const admin = userData.role === "admin";
        setIsAdmin(admin);

        socket?.emit("userOnline", userData._id);

        const convRes = await api.getConversations();
        if (convRes.success) setConversations(convRes.data ?? []);

        if (admin) {
          const studentsRes = (await api.getAllStudents(1, 200)) as any;
          const raw: any[] = Array.isArray(studentsRes?.data)
            ? studentsRes.data
            : (studentsRes?.data?.students ?? studentsRes?.students ?? []);

          const enrolled = raw.filter(
            (s: any) =>
              s.enrollments?.length > 0 ||
              s.courses?.length > 0 ||
              s.enrollmentCount > 0,
          );
          setEnrolledStudents(enrolled.length > 0 ? enrolled : raw);
        }
      } catch (err) {
        toast.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    initData();
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // ── Socket Events (Messages, Typings, Deletions) ──
  useEffect(() => {
    if (!socket) return;

    socket.on("messageReceived", (incomingMsg) => {
      if (!incomingMsg) return;
      if (activeChat && incomingMsg.conversationId === activeChat._id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === incomingMsg._id)) return prev;
          return [...prev, incomingMsg];
        });

        // Auto Mark as seen if chat is open
        if (incomingMsg.senderId !== currentUser?._id) {
          api.markAsSeen(incomingMsg._id).catch(() => {});
          socket?.emit("markSeen", {
            messageId: incomingMsg._id,
            conversationId: activeChat._id,
          });
        }
      }
      setConversations((prev) =>
        prev.map((c) =>
          c._id === incomingMsg.conversationId
            ? { ...c, lastMessage: incomingMsg.text }
            : c,
        ),
      );
    });

    // Real-time Seen updates
    socket.on("messageSeenUpdate", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, seen: true } : m)),
      );
    });

    // Real-time Edit/Delete updates
    socket.on("messageDeletedUpdate", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    socket.on("messageEditedUpdate", ({ messageId, text }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, text } : m)),
      );
    });

    // Typing Indicators (Now using direct emit payload)
    socket.on("userTyping", (payload) => {
      if (!payload) return;
      const { conversationId } = payload;
      if (activeChat && conversationId === activeChat._id)
        setIsOtherUserTyping(true);
    });
    socket.on("userStoppedTyping", (payload) => {
      if (!payload) return;
      const { conversationId } = payload;
      if (activeChat && conversationId === activeChat._id)
        setIsOtherUserTyping(false);
    });

    // Dynamic Online Status
    socket.on("onlineUsers", (users: string[]) => {
      setOnlineUsersList(users);
    });

    return () => {
      socket.off("messageReceived");
      socket.off("messageSeenUpdate");
      socket.off("messageDeletedUpdate");
      socket.off("messageEditedUpdate");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("onlineUsers");
    };
  }, [activeChat, currentUser]);

  // ── Load messages on chat select ──
  useEffect(() => {
    if (!activeChat || activeChat._newChat) return;
    if (
      !activeChat._id ||
      activeChat._id === "null" ||
      typeof activeChat._id !== "string"
    )
      return;

    const load = async () => {
      try {
        const res = await api.getMessages(activeChat._id);
        const fetchedMsgs = res.data ?? [];
        setMessages(fetchedMsgs);
        socket?.emit("joinRoom", activeChat._id);

        // Mark unseen messages as seen
        fetchedMsgs.forEach((m: any) => {
          if (!m.seen && m.senderId !== currentUser?._id) {
            api.markAsSeen(m._id).catch(() => {});
            socket?.emit("markSeen", {
              messageId: m._id,
              conversationId: activeChat._id,
            });
          }
        });
      } catch {
        toast.error("Could not load messages");
      }
    };
    load();
  }, [activeChat]);

  // ── Auto scroll ──
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherUserTyping]);

  // ── Typing Handler ──
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!activeChat || activeChat._newChat) return;

    // Direct Receiver ID for typing indicator
    const receiverId = activeChat.participants.find(
      (p: any) => p._id !== currentUser?._id,
    )?._id;

    socket?.emit("typing", {
      conversationId: activeChat._id,
      senderId: currentUser?._id,
      receiverId,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", {
        conversationId: activeChat._id,
        senderId: currentUser?._id,
        receiverId,
      });
    }, 2000);
  };

  // ── Send / Edit message ──
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || isSending || !currentUser) return;

    setIsSending(true);

    const receiverId = activeChat._newChat
      ? activeChat._receiverId
      : activeChat.participants.find((p: any) => p._id !== currentUser._id)
          ?._id;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (!activeChat._newChat) {
      socket?.emit("stopTyping", {
        conversationId: activeChat._id,
        senderId: currentUser?._id,
        receiverId,
      });
    }

    try {
      if (editingMsgId) {
        // EDIT LOGIC
        const res = await api.editMessage({
          messageId: editingMsgId,
          text: newMessage,
        });
        if (res.success) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === editingMsgId ? { ...m, text: newMessage } : m,
            ),
          );
          socket?.emit("messageEdited", {
            messageId: editingMsgId,
            text: newMessage,
            conversationId: activeChat._id,
          });
          setNewMessage("");
          setEditingMsgId(null);
        }
      } else {
        // SEND NEW MESSAGE LOGIC
        const payload = {
          receiverId,
          text: newMessage,
          conversationId: activeChat._newChat ? undefined : activeChat._id,
        };

        const res = await api.sendMessage(payload);
        if (res.success) {
          const newMsg = (res as any).data;

          if (activeChat._newChat) {
            const convRes = await api.getConversations();
            if (convRes.success) {
              const updated = convRes.data ?? [];
              setConversations(updated);
              const newConv = updated.find((c: any) =>
                c.participants.some((p: any) => p._id === receiverId),
              );
              if (newConv) setActiveChat(newConv);
            }
          } else {
            setConversations((prev) =>
              prev.map((c) =>
                c._id === activeChat._id
                  ? { ...c, lastMessage: newMessage }
                  : c,
              ),
            );
          }

          setMessages((prev) => {
            if (prev.some((msg) => msg._id === newMsg._id)) return prev;
            return [...prev, newMsg];
          });

          socket?.emit("newMessage", newMsg);
          setNewMessage("");
        }
      }
    } catch {
      toast.error("Failed to process message");
    } finally {
      setIsSending(false);
    }
  };

  // ── Delete Message ──
  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteMessage(id);
      if (res.success) {
        setMessages((prev) => prev.filter((m) => m._id !== id));
        socket?.emit("messageDeleted", {
          messageId: id,
          conversationId: activeChat._id,
        });
        toast.success("Message deleted");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleStudentClick = async (student: any) => {
    const existing = conversations.find((c) =>
      c.participants.some(
        (p: any) => p._id === student._id || p === student._id,
      ),
    );
    if (existing) {
      setActiveChat(existing);
      return;
    }
    setActiveChat({
      _id: null,
      participants: [currentUser, student],
      lastMessage: "",
      _newChat: true,
      _receiverId: student._id,
    });
    setMessages([]);
  };

  const getOtherUser = (chat: any) =>
    chat.participants?.find((p: any) => p._id !== currentUser?._id);

  const sidebarList = isAdmin
    ? enrolledStudents.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : conversations;

  if (loading)
    return (
      <div className="h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400"
          size={40}
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading messages...
        </p>
      </div>
    );

  return (
    <div className="w-full h-[calc(100vh-64px)] flex bg-white dark:bg-slate-900 overflow-hidden relative">
      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}
      >
        <div className="p-4 md:p-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-black text-[#0a348f] dark:text-blue-400 mb-3">
            {isAdmin ? "Students" : "Support"}
          </h2>
          {isAdmin && (
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={15}
              />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl bg-slate-100 dark:bg-slate-800 border-none h-10 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
          {isAdmin ? (
            sidebarList.length > 0 ? (
              sidebarList.map((student: any, index: number) => {
                const conv = conversations.find((c) =>
                  c.participants.some((p: any) => p._id === student._id),
                );
                const isActive = activeChat?.participants?.some(
                  (p: any) => p._id === student._id,
                );
                return (
                  <div
                    key={`student-${student._id || index}`}
                    onClick={() => handleStudentClick(student)}
                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-b border-slate-100 dark:border-slate-800/60 transition-all ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 md:border-l-4 md:border-l-[#0a348f]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-[#0a348f] dark:text-blue-400 shrink-0 overflow-hidden">
                      {student.photoURL ? (
                        <img
                          src={student.photoURL}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span>{student.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {conv?.lastMessage || student.email}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center text-sm text-slate-400">
                No enrolled students
              </div>
            )
          ) : (
            sidebarList.map((chat: any, index: number) => {
              const admin = getOtherUser(chat);
              return (
                <div
                  key={`chat-${chat._id || index}`}
                  onClick={() => setActiveChat(chat)}
                  className={`flex items-center gap-4 p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-all ${
                    activeChat?._id === chat._id
                      ? "bg-blue-50 dark:bg-blue-900/20 md:border-l-4 md:border-l-[#0a348f]"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-[#0a348f] flex items-center justify-center text-white font-bold shrink-0 overflow-hidden">
                    {admin?.photoURL ? (
                      <img
                        src={admin.photoURL}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <ShieldCheck size={22} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {admin?.name || "Admin"}
                      </p>
                      <span className="text-[9px] font-black text-[#0a348f] dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {chat.lastMessage || "Send a message to admin"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══════════════ CHAT WINDOW ═══════════════ */}
      <div
        className={`flex-1 flex-col bg-slate-50 dark:bg-slate-950 ${!activeChat ? "hidden md:flex" : "flex"} relative`}
      >
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 md:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10 relative">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveChat(null);
                    setEditingMsgId(null);
                  }}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <ChevronLeft size={22} />
                </button>

                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#0a348f] dark:bg-blue-600 text-white flex items-center justify-center font-bold overflow-hidden">
                  {getOtherUser(activeChat)?.photoURL ? (
                    <img
                      src={getOtherUser(activeChat)?.photoURL}
                      className="w-full h-full object-cover"
                      alt=""
                    />
                  ) : (
                    <span>
                      {getOtherUser(activeChat)?.name?.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm md:text-base">
                    {getOtherUser(activeChat)?.name || "Unknown"}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {/* WhatsApp Style Dynamic Status */}
                    {isOtherUserTyping ? (
                      <span className="text-[11px] font-bold text-[#0a348f] dark:text-blue-400 italic lowercase tracking-wide">
                        typing...
                      </span>
                    ) : onlineUsersList.includes(
                        getOtherUser(activeChat)?._id,
                      ) ? (
                      <>
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Online
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Offline
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 rounded-full"
              >
                <MoreVertical size={20} />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?._id;
                  return (
                    <motion.div
                      key={`msg-${msg._id || index}`}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}
                    >
                      {/* 🚀 3 Dots Menu for Edit/Delete (Only for sender) */}
                      {isMe && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-full mr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-1.5 text-slate-400 hover:text-[#0a348f] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors outline-none">
                                <MoreHorizontal size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-32 rounded-xl shadow-xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMsgId(msg._id);
                                  setNewMessage(msg.text);
                                }}
                                className="cursor-pointer py-2.5 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-slate-800"
                              >
                                <Pencil
                                  size={13}
                                  className="mr-2 text-blue-500"
                                />{" "}
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(msg._id)}
                                className="cursor-pointer py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 focus:text-red-500"
                              >
                                <Trash2 size={13} className="mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] md:max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-[#0a348f] dark:bg-blue-600 text-white rounded-tr-sm"
                            : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700"
                        } ${editingMsgId === msg._id ? "ring-2 ring-amber-400" : ""}`}
                      >
                        {msg.text}

                        <div
                          className={`flex items-center gap-1.5 mt-1.5 opacity-70 ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-[9px] font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {/* SEEN/UNSEEN TICKS */}
                          {isMe &&
                            (msg.seen ? (
                              <CheckCheck
                                size={13}
                                className="text-blue-300 dark:text-blue-300"
                              />
                            ) : (
                              <Check size={13} className="text-white/70" />
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={scrollRef} className="h-4" />
            </div>

            {/* Input Area - Adjusted for Bottom Nav on Mobile */}
            <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[80px] md:pb-4">
              {editingMsgId && (
                <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 mb-2 rounded-lg text-xs font-bold">
                  <span>Editing message...</span>
                  <button
                    onClick={() => {
                      setEditingMsgId(null);
                      setNewMessage("");
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hidden sm:flex"
                >
                  <Paperclip size={18} />
                </Button>

                {/* 🚀 FIXED INPUT STYLING */}
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-slate-700 dark:text-slate-200 h-10 md:h-11 flex-1"
                />

                <Button
                  disabled={!newMessage.trim() || isSending}
                  className="bg-[#0a348f] dark:bg-blue-600 hover:bg-blue-800 text-white rounded-xl h-10 md:h-11 px-4"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Send size={17} />
                  )}
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full">
              <User size={56} className="text-slate-300 dark:text-slate-600" />
            </div>
            <p className="font-medium text-sm">
              {isAdmin
                ? "Select a student to start chatting"
                : "Click on Admin to start chatting"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
