"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  BookOpen,
  Calendar,
  Loader2,
  ChevronDown,
  PlayCircle,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-cyan-500 to-blue-600",
];

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res: any = await api.getAllStudents(1, 100);
        const payload = res?.data ?? res;
        const list: any[] = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
            ? payload
            : [];
        const total = payload?.totalStudents ?? payload?.total ?? list.length;
        setStudents(list);
        setTotalCount(total);
      } catch {
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <Users
                  size={18}
                  className="text-[#0a348f] dark:text-blue-400"
                />
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Students
                </h1>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                {loading ? "Loading..." : `${totalCount} total enrolled`}
              </p>
            </div>
            <div className="relative flex items-center">
              <Search
                size={14}
                className="absolute left-3.5 text-slate-400 dark:text-zinc-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-zinc-700 rounded-xl w-48 sm:w-64 text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:border-[#0a348f] dark:focus:border-blue-500 transition-all bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xs">
            <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 shrink-0">
                <Users
                  size={15}
                  className="text-[#0a348f] dark:text-blue-400"
                />
              </div>
              <div>
                {loading ? (
                  <div className="h-5 w-8 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {totalCount}
                  </p>
                )}
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                  Total
                </p>
              </div>
            </div>
            <div className="border border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 shrink-0">
                <BookOpen
                  size={15}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                {loading ? (
                  <div className="h-5 w-8 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                ) : (
                  <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                    {students.reduce(
                      (acc, s) => acc + (s.enrollments?.length || 0),
                      0,
                    )}
                  </p>
                )}
                <p className="text-[9px] text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                  Enrollments
                </p>
              </div>
            </div>
          </div>

          {/* Students list */}
          <div className="border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2
                  size={28}
                  className="animate-spin text-[#0a348f] dark:text-blue-400"
                />
                <p className="text-xs font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                  Loading students...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Users
                  size={32}
                  className="text-slate-200 dark:text-zinc-700"
                />
                <p className="text-sm font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                  No students found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                <AnimatePresence>
                  {filtered.map((student, idx) => {
                    const initials =
                      student.name
                        ?.split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "ST";
                    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const isOpen = expanded === student._id;
                    const enrollments: any[] = student.enrollments || [];

                    return (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        {/* Student Row */}
                        <div
                          className={`flex items-center gap-3 px-4 sm:px-6 py-4 cursor-pointer transition-all ${
                            isOpen
                              ? "bg-blue-50/50 dark:bg-blue-500/5 border-l-4 border-l-[#0a348f] dark:border-l-blue-500"
                              : "hover:bg-slate-50 dark:hover:bg-zinc-800/30 border-l-4 border-l-transparent"
                          }`}
                          onClick={() =>
                            setExpanded(isOpen ? null : student._id)
                          }
                        >
                          {/* Avatar */}
                          <div
                            className={`w-10 h-10 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shrink-0 shadow-md overflow-hidden`}
                          >
                            {student.photoURL ? (
                              <img
                                src={student.photoURL}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-black text-xs">
                                {initials}
                              </span>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-slate-800 dark:text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                                <Calendar size={9} />{" "}
                                {formatDate(student.createdAt)}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                                <BookOpen size={9} /> {enrollments.length}{" "}
                                courses
                              </span>
                            </div>
                          </div>

                          {/* Expand */}
                          <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-all shrink-0">
                            <ChevronDown
                              size={15}
                              className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                          </button>
                        </div>

                        {/* Courses Expansion */}
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-slate-50/50 dark:bg-zinc-900/50 border-t border-slate-100 dark:border-zinc-800">
                                {enrollments.length === 0 ? (
                                  <div className="px-8 py-6 flex items-center gap-3 text-slate-400 dark:text-zinc-500">
                                    <BookOpen size={16} />
                                    <span className="text-sm font-bold">
                                      No courses purchased yet
                                    </span>
                                  </div>
                                ) : (
                                  <div className="px-4 sm:px-8 py-4 space-y-3">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                                      Purchased Courses
                                    </p>
                                    {enrollments.map((enr: any) => (
                                      <div
                                        key={enr.enrollmentId}
                                        className="flex items-center gap-3 p-3 rounded-2xl border bg-white dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-700 transition-all"
                                      >
                                        {/* Thumbnail */}
                                        <div className="w-12 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-zinc-700 flex items-center justify-center">
                                          {enr.thumbnail ? (
                                            <img
                                              src={enr.thumbnail}
                                              alt=""
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <PlayCircle
                                              size={14}
                                              className="text-slate-400"
                                            />
                                          )}
                                        </div>

                                        {/* Title + meta */}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold truncate text-slate-800 dark:text-white">
                                            {enr.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                                              PKR {enr.price?.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-slate-300 dark:text-zinc-600">
                                              •
                                            </span>
                                            <span
                                              className={`text-[10px] font-bold ${enr.accessType === "half" ? "text-amber-500" : "text-emerald-500"}`}
                                            >
                                              {enr.accessType === "half"
                                                ? "Half Access"
                                                : "Full Access"}
                                            </span>
                                            <span className="text-[10px] text-slate-300 dark:text-zinc-600">
                                              •
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center gap-0.5">
                                              <CheckCircle2 size={9} />{" "}
                                              {enr.progress}%
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
