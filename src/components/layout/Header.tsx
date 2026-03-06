"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  X,
  Tag,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/services/api";

// ═══════════════════════════════════════════
//  GlobalSearch — courses + students dropdown
// ═══════════════════════════════════════════
function GlobalSearch({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ courses: any[]; students: any[] }>({
    courses: [],
    students: [],
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // ── Close on outside click ──
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Debounced API search ──
  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], students: [] });
      setOpen(false);
      return;
    }

    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const q = query.toLowerCase();

        // Sirf courses — student-facing search
        const cRes: any = await api.getAllCourses();
        const allCourses = cRes?.courses || cRes?.data?.courses || [];
        const filteredCourses = allCourses
          .filter(
            (c: any) =>
              c.title?.toLowerCase().includes(q) ||
              c.category?.toLowerCase().includes(q) ||
              c.instructor?.toLowerCase().includes(q),
          )
          .slice(0, 5);

        setResults({ courses: filteredCourses, students: [] });
        setOpen(true);
      } catch {
        setResults({ courses: [], students: [] });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current!);
  }, [query]);

  const hasResults = results.courses.length > 0 || results.students.length > 0;
  const isEmpty = !loading && !!query.trim() && !hasResults;

  const clear = () => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
    onClose?.();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Input ── */}
      <div className="relative group">
        {loading ? (
          <Loader2
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a348f] dark:text-blue-400 animate-spin pointer-events-none"
          />
        ) : (
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0a348f] dark:group-focus-within:text-blue-400 transition-colors pointer-events-none"
          />
        )}
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => hasResults && setOpen(true)}
          placeholder="Search courses, students..."
          className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:border-[#0a348f] dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-[#0a348f]/10 dark:focus:ring-blue-500/20 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
        />
        {query && (
          <button
            onClick={clear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <X size={12} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* ── Results Dropdown ── */}
      <AnimatePresence>
        {open && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-999 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center gap-2 py-8">
                <Search
                  size={22}
                  className="text-slate-200 dark:text-slate-700"
                />
                <p className="text-xs font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">
                  No results for "{query}"
                </p>
              </div>
            )}

            {/* ── Courses ── */}
            {results.courses.length > 0 && (
              <div>
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <BookOpen
                      size={10}
                      className="text-[#0a348f] dark:text-blue-400"
                    />
                    <span className="text-[10px] font-black text-[#0a348f] dark:text-blue-400 uppercase tracking-widest">
                      Courses
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">
                    {results.courses.length} found
                  </span>
                </div>
                {results.courses.map((course, i) => (
                  <motion.button
                    key={course._id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/course/${course._id}`)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group/item border-b border-slate-50 dark:border-slate-800/60 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={13} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-800 dark:text-white truncate group-hover/item:text-[#0a348f] dark:group-hover/item:text-blue-400 transition-colors">
                        {course.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Tag
                          size={9}
                          className="text-slate-300 dark:text-slate-600"
                        />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#0a348f] dark:text-blue-400 shrink-0">
                      PKR {course.price}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}

            {/* Footer */}
            {hasResults && (
              <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-50 dark:border-slate-800">
                <p className="text-[10px] text-center text-slate-300 dark:text-slate-600 font-semibold">
                  {results.courses.length} results for "{query}"
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
//  Main Header
// ═══════════════════════════════════════════
export const Header = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
        const userData = res?.user || res?.data?.user || res?.data || res;
        if (userData && userData._id) setUser(userData);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  // ✅ Skeleton — prevents remount hang
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95" />
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur transition-all duration-300">
      <div className="container mx-auto px-4 lg:px-8">
        {/* ── Main row ── */}
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: hamburger + logo + desktop nav */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg outline-none transition-colors">
                    <Menu
                      size={24}
                      className="text-[#0a348f] dark:text-blue-400"
                    />
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800"
                >
                  <SheetHeader className="text-left border-b border-slate-100 dark:border-slate-800 pb-4">
                    <SheetTitle>
                      <Link
                        href="/"
                        className="text-2xl font-bold text-[#0a348f] dark:text-blue-400"
                      >
                        CYBEX
                      </Link>
                    </SheetTitle>
                    <SheetDescription className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                      Learning Portal
                    </SheetDescription>
                  </SheetHeader>
                  <nav className="flex flex-col gap-4 mt-8 pl-2">
                    {[
                      { href: "/course", label: "Courses" },
                      { href: "/course/my-courses", label: "My Courses" },
                      { href: "/messages", label: "Messages" },
                      { href: "/settings", label: "Settings" },
                    ].map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className="text-lg font-semibold text-slate-700 dark:text-slate-200 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>

            <Link
              href="/"
              className="text-2xl font-bold text-[#0a348f] dark:text-blue-400"
            >
              CYBEX
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-sm font-bold ml-4 text-slate-600 dark:text-slate-300">
              <Link
                href="/course"
                className="hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors"
              >
                Courses
              </Link>
              <Link
                href="/course/my-courses"
                className="hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors"
              >
                My Courses
              </Link>
            </nav>
          </div>

          {/* Center: Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <GlobalSearch />
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            {/* Mobile: search icon toggle */}
            <button
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="md:hidden p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full transition-colors"
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            <Link href="/messages" className="hidden sm:block">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full transition-colors">
                <MessageSquare size={20} />
              </button>
            </Link>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full relative outline-none transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 font-bold">
                    3
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-80 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <DropdownMenuLabel className="font-bold text-slate-800 dark:text-slate-100 p-3">
                  Notifications
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:border-slate-800" />
                <div className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem className="p-3 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#0a348f] dark:text-blue-400 shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          New Lesson: Auth Hooks
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Instructor added a new video.
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <div className="p-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <Link href="/notifications" className="block w-full">
                    <button className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-[#0a348f] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all">
                      View all notifications <ChevronRight size={14} />
                    </button>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/settings" className="hidden lg:block">
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#0a348f] dark:hover:text-blue-400 rounded-full transition-colors">
                <Settings size={20} />
              </button>
            </Link>

            {/* Profile dropdown */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer outline-none hover:scale-105 transition-transform ml-1">
                  <Avatar className="h-9 w-9 border-2 border-white dark:border-slate-800 shadow-md">
                    <AvatarImage
                      src={user?.photoURL || user?.avatar}
                      alt={user?.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-[#0a348f] text-white font-bold">
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
                className="w-64 rounded-2xl p-2 mt-2 shadow-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {loading ? "Loading..." : user?.name || "Guest User"}
                    </p>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 truncate">
                      {loading ? "Fetching..." : user?.email || "Please login"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:border-slate-800" />
                <div className="p-1 space-y-0.5">
                  <DropdownMenuItem
                    className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onSelect={() => {
                      setDropdownOpen(false);
                      setTimeout(() => router.push("/profile"), 100);
                    }}
                  >
                    <User className="mr-3 h-4 w-4 text-[#0a348f] dark:text-blue-400" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      My Profile
                    </span>
                  </DropdownMenuItem>

                  {user?.role === "admin" && (
                    <DropdownMenuItem
                      className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onSelect={() => {
                        setDropdownOpen(false);
                        setTimeout(() => router.push("/admin"), 100);
                      }}
                    >
                      <ShieldCheck className="mr-3 h-4 w-4 text-amber-500" />
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        Admin Panel
                      </span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="cursor-pointer py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    onSelect={() => {
                      setDropdownOpen(false);
                      setTimeout(() => router.push("/settings"), 100);
                    }}
                  >
                    <Settings className="mr-3 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Settings
                    </span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* ── Mobile Search Row — slide down ── */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-visible pb-3"
            >
              <GlobalSearch onClose={() => setMobileSearchOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
