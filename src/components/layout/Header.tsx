"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Bell,
  Settings,
  Menu,
  User,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex flex-col md:flex-row md:h-16 items-center justify-between px-4 py-2 md:py-0 lg:px-8 gap-3 md:gap-0">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4">
            {/* --- MOBILE MENU --- */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 rounded-lg outline-none">
                    <Menu size={24} className="text-[#0a348f]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <SheetHeader className="text-left border-b pb-4">
                    <SheetTitle>
                      <Link
                        href="/"
                        className="text-2xl font-bold text-[#0a348f]"
                      >
                        CYBEX
                      </Link>
                    </SheetTitle>
                    <SheetDescription className="text-[10px] uppercase font-bold text-slate-400">
                      Learning Portal
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8 pl-2">
                    <Link
                      href="/"
                      className="text-lg font-semibold text-slate-700"
                    >
                      My Courses
                    </Link>
                    <Link
                      href="/explore"
                      className="text-lg font-semibold text-slate-700"
                    >
                      Explore
                    </Link>
                    <Link
                      href="/messages"
                      className="text-lg font-semibold text-slate-700"
                    >
                      Messages
                    </Link>
                    <Link
                      href="/settings"
                      className="text-lg font-semibold text-slate-700"
                    >
                      Settings
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link href="/" className="text-2xl font-bold text-[#0a348f]">
              CYBEX
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold ml-8 text-slate-600">
            <Link href="/" className="hover:text-[#0a348f] transition-colors">
              My Courses
            </Link>
            <Link
              href="/explore"
              className="hover:text-[#0a348f] transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/mentors"
              className="hover:text-[#0a348f] transition-colors"
            >
              Mentors
            </Link>
          </nav>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="w-full md:flex-1 md:px-8 max-md:max-w-md">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a348f]"
              size={18}
            />
            <Input
              placeholder="Search for courses..."
              className="pl-10 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#0a348f]/20 h-10 md:h-11 w-full"
            />
          </div>
        </div>

        {/* --- ACTIONS --- */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-400">
            <Link href="/messages">
              <button className="p-2 hover:bg-slate-50 hover:text-[#0a348f] rounded-full relative">
                <MessageSquare size={20} />
              </button>
            </Link>

            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-50 hover:text-[#0a348f] rounded-full relative outline-none">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    3
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100"
              >
                <DropdownMenuLabel className="font-bold text-slate-800 p-3">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-slate-50">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0a348f] shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          New Lesson: Auth Hooks
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Ishaq Bhojani added a new video.
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem asChild className="p-0 focus:bg-transparent">
                  <Link href="/notifications" className="w-full">
                    <button className="w-full py-3 text-sm font-bold text-[#0a348f] hover:bg-blue-50 rounded-xl transition-colors">
                      View all notifications
                    </button>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/settings">
              <button className="p-2 hover:bg-slate-50 hover:text-[#0a348f] rounded-full hidden lg:block">
                <Settings size={20} />
              </button>
            </Link>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="h-9 w-9 rounded-full bg-[#0a348f] flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform shadow-md outline-none">
                R
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100"
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Rahid Malik
                  </p>
                  <p className="text-xs text-muted-foreground">
                    rahid@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-1">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer py-3 rounded-xl"
                >
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4 text-[#0a348f]" />
                    <span className="font-medium text-slate-700">
                      My Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer py-3 rounded-xl"
                >
                  <Link href="/admin" className="flex items-center">
                    <ShieldCheck className="mr-3 h-4 w-4 text-amber-500" />
                    <span className="font-medium text-slate-700">
                      Admin Panel
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer py-3 rounded-xl"
                >
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4 text-slate-400" />
                    <span className="font-medium text-slate-700">Settings</span>
                  </Link>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
