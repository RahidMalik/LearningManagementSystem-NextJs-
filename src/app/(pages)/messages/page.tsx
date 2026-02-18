"use client";

import { useState } from "react";
import { Send, Search, MoreVertical, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState(0);
  const [newMessage, setNewMessage] = useState("");

  const contacts = [
    {
      id: 0,
      name: "Rahid Malik",
      role: "MERN Instructor",
      lastMsg: "Assignments check kar liye?",
      time: "10:30 AM",
      online: true,
    },
    {
      id: 1,
      name: "Admin Support",
      role: "Support",
      lastMsg: "Your refund request is processed.",
      time: "Yesterday",
      online: false,
    },
    {
      id: 2,
      name: "Graphic Team",
      role: "Mentor",
      lastMsg: "Logo files bhej dein.",
      time: "2 days ago",
      online: true,
    },
  ];

  const chatHistory = [
    {
      id: 1,
      sender: "them",
      text: "Assalam-o-Alaikum! Course mein koi masla to nahi?",
      time: "10:00 AM",
    },
    {
      id: 2,
      sender: "me",
      text: "Walaikum Assalam sir, nahi sab samajh aa raha hai.",
      time: "10:05 AM",
    },
    {
      id: 3,
      sender: "them",
      text: "Zabardast! Next module assignments lazmi submit karayein.",
      time: "10:10 AM",
    },
  ];

  return (
    <div className="container mx-auto h-[calc(100vh-100px)] flex overflow-hidden bg-white border rounded-2xl shadow-sm my-4">
      {/* --- Sidebar: Contacts List --- */}
      <div className="w-full md:w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-[#0a348f] mb-4">Messages</h2>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="Search chats..."
              className="pl-9 rounded-xl bg-slate-50 border-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all ${activeChat === contact.id ? "bg-blue-50 border-r-4 border-[#0a348f]" : "hover:bg-slate-50"}`}
            >
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[#0a348f]">
                  {contact.name[0]}
                </div>
                {contact.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-slate-800 truncate">
                    {contact.name}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {contact.time}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {contact.lastMsg}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Main Chat Window --- */}
      <div className="hidden md:flex flex-1 flex-col bg-slate-50/30">
        {/* Chat Header */}
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0a348f] text-white flex items-center justify-center font-bold">
              {contacts[activeChat].name[0]}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">
                {contacts[activeChat].name}
              </h3>
              <p className="text-[10px] text-green-500 font-bold uppercase">
                {contacts[activeChat].role}
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  msg.sender === "me"
                    ? "bg-[#0a348f] text-white rounded-tr-none"
                    : "bg-white border text-slate-700 rounded-tl-none shadow-sm"
                }`}
              >
                {msg.text}
                <p
                  className={`text-[9px] mt-1 ${msg.sender === "me" ? "text-blue-200" : "text-slate-400"}`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setNewMessage("");
            }}
          >
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-[#0a348f]"
            >
              <Paperclip size={20} />
            </button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border-slate-200 focus-visible:ring-[#0a348f]"
            />
            <Button className="bg-[#0a348f] hover:bg-blue-800 rounded-xl px-5">
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
