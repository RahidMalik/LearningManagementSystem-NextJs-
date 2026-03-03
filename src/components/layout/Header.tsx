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
  Loader2,
  ChevronRight, // Added for the View All arrow
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";

export const Header = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.getProfile();

        if (res?.success || res?.data?.success) {
          setUser(res.success ? res.user : res.data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/course?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/course");
    }
  };

  if (!mounted) return null;

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "R";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-all duration-300">
      <div className="container mx-auto flex flex-col md:flex-row md:h-16 items-center justify-between px-4 py-2 md:py-0 lg:px-8 gap-3 md:gap-0">
        <div className="flex w-full md:w-auto items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-4">
            {/* --- MOBILE MENU --- */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg outline-none transition-colors duration-300">
                    <Menu
                      size={24}
                      className="text-[#0a348f] dark:text-blue-400 transition-colors duration-300"
                    />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300"
                >
                  <SheetHeader className="text-left border-b border-slate-100 dark:border-slate-800 pb-4">
                    <SheetTitle>
                      <Link
                        href="/"
                        className="text-2xl font-bold text-[#0a348f] dark:text-blue-400 transition-colors duration-300"
                      >
                        CYBEX
                      </Link>
                    </SheetTitle>
                    <SheetDescription className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Learning Portal
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8 pl-2">
                    <Link
                      href="/course"
                      className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
                    >
                      Courses
                    </Link>
                    <Link
                      href="/course/my-courses"
                      className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
                    >
                      My Courses
                    </Link>
                    <Link
                      href="/messages"
                      className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
                    >
                      Messages
                    </Link>
                    <Link
                      href="/settings"
                      className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
                    >
                      Settings
                    </Link>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link
              href="/"
              className="text-2xl font-bold text-[#0a348f] dark:text-blue-400 transition-colors duration-300"
            >
              CYBEX
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-bold ml-8 text-slate-600 dark:text-slate-300">
            <Link
              href="/course"
              className="hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
            >
              Courses
            </Link>
            <Link
              href="/course/my-courses"
              className="hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
            >
              My Courses
            </Link>
          </nav>
        </div>

        {/* --- SEARCH BAR WITH LOGIC --- */}
        <div className="w-full md:flex-1 md:px-8 max-md:max-w-md">
          <form onSubmit={handleSearch} className="relative group">
            <Search
              onClick={() => handleSearch()}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a348f] dark:group-focus-within:text-blue-400 transition-colors duration-300 cursor-pointer"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for courses..."
              className="pl-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-none focus-visible:ring-2 focus-visible:ring-[#0a348f]/20 dark:focus-visible:ring-blue-500/50 dark:text-slate-200 h-10 md:h-11 w-full transition-colors duration-300"
            />
          </form>
        </div>

        {/* --- ACTIONS --- */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Link href="/messages">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full relative transition-colors duration-300">
                <MessageSquare size={20} />
              </button>
            </Link>

            {/* --- NOTIFICATIONS DROPDOWN --- */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full relative outline-none transition-colors duration-300">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 font-bold transition-colors duration-300">
                    3
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300"
              >
                <DropdownMenuLabel className="font-bold text-slate-800 dark:text-slate-100 p-3">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:border-slate-800" />

                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0a348f] dark:text-blue-400 shrink-0 transition-colors duration-300">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">
                          New Lesson: Auth Hooks
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 transition-colors duration-300">
                          Ishaq Bhojani added a new video.
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {/* You can map more notifications here */}
                </div>

                {/* --- ADDED: VIEW ALL NOTIFICATIONS BUTTON --- */}
                <div className="p-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <Link href="/notifications" className="block w-full">
                    <button className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-[#0a348f] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                      View all notifications
                      <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/settings">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full hidden lg:block transition-colors duration-300">
                <Settings size={20} />
              </button>
            </Link>
          </div>

          {/* --- PROFILE DROPDOWN WITH DYNAMIC AVATAR --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer outline-none hover:scale-105 transition-transform duration-300">
                <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-md transition-colors duration-300">
                  <AvatarImage
                    src={user?.photoURL}
                    alt={user?.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#0a348f] text-white font-bold transition-colors duration-300">
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      userInitial
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-64 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300"
            >
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">
                    {loading ? "Loading..." : user?.name || "User Name"}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 truncate transition-colors duration-300">
                    {loading
                      ? "Fetching..."
                      : user?.email || "email@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="dark:border-slate-800" />
              <div className="p-1">
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                >
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-3 h-4 w-4 text-[#0a348f] dark:text-blue-400 transition-colors duration-300" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors duration-300">
                      My Profile
                    </span>
                  </Link>
                </DropdownMenuItem>
                {user?.role === "admin" && (
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                  >
                    <Link href="/admin" className="flex items-center">
                      <ShieldCheck className="mr-3 h-4 w-4 text-amber-500 transition-colors duration-300" />
                      <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors duration-300">
                        Admin Panel
                      </span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  asChild
                  className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-300"
                >
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-3 h-4 w-4 text-slate-400 dark:text-slate-500 transition-colors duration-300" />
                    <span className="font-medium text-slate-700 dark:text-slate-200 transition-colors duration-300">
                      Settings
                    </span>
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
