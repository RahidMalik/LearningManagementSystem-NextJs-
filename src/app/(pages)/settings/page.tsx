"use client";

import {
  User,
  FileText,
  HelpCircle,
  UserPlus,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  LogIn,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        const res = await api.getProfile();
        if (res && res.success) {
          setUser(res.user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const settingsOptions = [
    {
      icon: <User size={20} />,
      label: "Edit Profile",
      href: "/profile",
      color: "text-blue-600",
    },
    {
      icon: <FileText size={20} />,
      label: "Terms & Conditions",
      href: "/terms",
      color: "text-[#0a348f]",
    },
    {
      icon: <HelpCircle size={20} />,
      label: "Help Center",
      href: "/help",
      color: "text-blue-500",
    },
    {
      icon: <UserPlus size={20} />,
      label: "Invite Friends",
      href: "/invite",
      color: "text-blue-700",
    },
  ];

  return (
    <div
      className={`min-h-screen py-8 px-4 flex justify-center transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      <div
        className={`w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-sm border transition-colors duration-300 ${
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <h1
          className={`text-2xl font-bold mb-8 ${isDarkMode ? "text-white" : "text-slate-900"}`}
        >
          Settings
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#0a348f]" />
            <p className="mt-4 text-slate-500 text-sm">Loading settings...</p>
          </div>
        ) : isLoggedIn ? (
          <>
            {/* --- USER PROFILE SECTION --- */}
            <div
              className={`flex items-center gap-5 p-4 rounded-2xl mb-8 border transition-all ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600"
                  : "bg-slate-50 border-slate-100"
              }`}
            >
              <Avatar className="h-16 w-16 md:h-20 md:w-20 border-2 border-white shadow-md">
                <AvatarImage
                  src={user?.photoURL}
                  alt={user?.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#0a348f] text-white text-xl font-bold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h2
                  className={`text-lg md:text-xl font-bold truncate ${
                    isDarkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {user?.name || "User Name"}
                </h2>
                <p
                  className={`text-sm truncate ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {user?.email || "email@example.com"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {settingsOptions.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                    isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`${item.color} group-hover:scale-110 transition-transform`}
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight
                    size={18}
                    className={`transition-colors ${
                      isDarkMode
                        ? "text-slate-500 group-hover:text-blue-400"
                        : "text-slate-300 group-hover:text-[#0a348f]"
                    }`}
                  />
                </Link>
              ))}

              {/* Dark Mode Toggle */}
              <div
                className={`flex items-center justify-between p-4 rounded-2xl mt-2 border border-dashed ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600"
                    : "bg-slate-50/50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  {isDarkMode ? (
                    <Moon size={20} className="text-indigo-400" />
                  ) : (
                    <Sun size={20} className="text-amber-500" />
                  )}
                  <span
                    className={`font-semibold ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
                  >
                    Dark Mode
                  </span>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    isDarkMode ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${
                      isDarkMode ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-between p-4 mt-6 rounded-2xl transition-all group border border-transparent ${
                  isDarkMode
                    ? "hover:bg-red-950/30 hover:border-red-900"
                    : "hover:bg-red-50 hover:border-red-100"
                }`}
              >
                <div className="flex items-center gap-4 text-red-500">
                  <LogOut size={20} />
                  <span className="font-bold">Logout</span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-red-300 group-hover:text-red-500"
                />
              </button>
            </div>
          </>
        ) : (
          /* --- NOT LOGGED IN STATE --- */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div
              className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 ${
                isDarkMode ? "bg-slate-700" : "bg-slate-100"
              }`}
            >
              <User
                size={40}
                className={isDarkMode ? "text-slate-500" : "text-slate-400"}
              />
            </div>
            <h2
              className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}
            >
              You are not logged in
            </h2>
            <p
              className={`text-sm mb-8 max-w-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Please log in to access your profile and settings.
            </p>
            <Link href="/login" className="w-full sm:w-auto">
              <button className="flex items-center justify-center gap-2 bg-[#0a348f] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-500/30 w-full">
                <LogIn size={20} /> Login Now
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
