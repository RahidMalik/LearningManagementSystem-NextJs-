"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ShieldCheck,
  ShieldOff,
  Search,
  MoreVertical,
  BookOpen,
  Calendar,
  UserCheck,
  UserX,
  Loader2,
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
  const [filter, setFilter] = useState<"all" | "active" | "revoked">("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ── Fetch students ──
  useEffect(() => {
    const fetch = async () => {
      try {
        const res: any = await api.getAllStudents(1, 10);
        const raw =
          res?.data?.data ||
          res?.data?.students ||
          res?.students ||
          res?.data ||
          [];
        const data = Array.isArray(raw) ? raw : [];
        setStudents(data);
      } catch {
        toast.error("Failed to fetch students");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Toggle access — needs backend endpoint ──
  const toggleAccess = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "revoked" : "active";
      await api.toggleStudentAccess(id, newStatus);
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s)),
      );
      toast.success(
        newStatus === "active" ? "Access granted!" : "Access revoked!",
      );
    } catch {
      setStudents((prev) =>
        prev.map((s) =>
          s._id === id
            ? { ...s, status: s.status === "active" ? "revoked" : "active" }
            : s,
        ),
      );
    }
    setOpenMenu(null);
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (s.status || "active") === filter;
    return matchSearch && matchFilter;
  });

  const activeCount = students.filter(
    (s) => (s.status || "active") === "active",
  ).length;
  const revokedCount = students.filter((s) => s.status === "revoked").length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* ── Sticky Header ── */}
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
                {loading ? "Loading..." : `${students.length} total enrolled`}
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
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-zinc-700 rounded-xl w-48 sm:w-56 text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:border-[#0a348f] dark:focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* ── Stats ── */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                label: "Total",
                value: students.length,
                icon: Users,
                color: "text-[#0a348f] dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-500/10",
              },
              {
                label: "Active",
                value: activeCount,
                icon: UserCheck,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-50 dark:bg-emerald-500/10",
              },
              {
                label: "Revoked",
                value: revokedCount,
                icon: UserX,
                color: "text-red-500 dark:text-red-400",
                bg: "bg-red-50 dark:bg-red-500/10",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="border border-slate-100 dark:border-zinc-800 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-3 shadow-sm"
              >
                <div className={`p-2 sm:p-2.5 rounded-xl ${s.bg} shrink-0`}>
                  <s.icon size={15} className={s.color} />
                </div>
                <div>
                  {loading ? (
                    <div className="h-5 w-8 bg-slate-100 dark:bg-zinc-800 rounded animate-pulse" />
                  ) : (
                    <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-none">
                      {s.value}
                    </p>
                  )}
                  <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Filter tabs ── */}
          <div className="flex gap-2">
            {(["all", "active", "revoked"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wide border transition-all ${
                  filter === f
                    ? "bg-[#0a348f] dark:bg-blue-500 text-white border-transparent shadow-md"
                    : "text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 hover:border-[#0a348f] dark:hover:border-blue-500"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* ── Students list ── */}
          <div className="border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-slate-100 dark:border-zinc-800">
              {["Student", "Enrolled", "Courses", ""].map((h, i) => (
                <p
                  key={i}
                  className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest"
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Loading state */}
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
              <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                <AnimatePresence>
                  {filtered.map((student, idx) => {
                    const status = student.status || "active";
                    const initials =
                      student.name
                        ?.split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || "ST";
                    const courses = student.courseCount || 0;
                    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                    return (
                      <motion.div
                        key={student._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ delay: idx * 0.03 }}
                        className="relative px-4 sm:px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-zinc-800/20 transition-all"
                      >
                        {/* ── Mobile ── */}
                        <div className="flex items-center gap-3 md:hidden">
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
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-sm text-slate-800 dark:text-white truncate">
                                {student.name}
                              </p>
                              <span
                                className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${
                                  status === "active"
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400"
                                }`}
                              >
                                {status === "active" ? "Active" : "Revoked"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                              {student.email}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                                <Calendar size={9} />{" "}
                                {formatDate(student.createdAt)}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-zinc-500">
                                <BookOpen size={9} /> {courses} courses
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleAccess(student._id, status)}
                            className={`shrink-0 p-2 rounded-xl transition-all border ${
                              status === "active"
                                ? "bg-red-50 dark:bg-red-500/10 text-red-500 border-red-100 dark:border-red-500/20 hover:bg-red-500 hover:text-white"
                                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                            }`}
                          >
                            {status === "active" ? (
                              <ShieldOff size={14} />
                            ) : (
                              <ShieldCheck size={14} />
                            )}
                          </button>
                        </div>

                        {/* ── Desktop ── */}
                        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center">
                          {/* Student info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shrink-0 shadow-md overflow-hidden`}
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
                            <div className="min-w-0">
                              <p className="font-black text-sm text-slate-800 dark:text-white truncate">
                                {student.name}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-zinc-500 truncate">
                                {student.email}
                              </p>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                            <Calendar
                              size={11}
                              className="text-slate-300 dark:text-zinc-600"
                            />
                            {formatDate(student.createdAt)}
                          </div>

                          {/* Courses + Status */}
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-500/10 text-[#0a348f] dark:text-blue-400 px-2.5 py-1 rounded-lg text-xs font-black">
                              <BookOpen size={10} /> {courses}
                            </div>
                            <div
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                                status === "active"
                                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400"
                              }`}
                            >
                              {status === "active" ? (
                                <>
                                  <ShieldCheck size={10} /> Active
                                </>
                              ) : (
                                <>
                                  <ShieldOff size={10} /> Revoked
                                </>
                              )}
                            </div>
                          </div>

                          {/* Action menu */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenu(
                                  openMenu === student._id ? null : student._id,
                                )
                              }
                              className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-xl transition-all"
                            >
                              <MoreVertical
                                size={15}
                                className="text-slate-400 dark:text-zinc-500"
                              />
                            </button>
                            <AnimatePresence>
                              {openMenu === student._id && (
                                <>
                                  {/* Backdrop */}
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenMenu(null)}
                                  />

                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                    className="absolute right-8 top-0 z-50 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden w-40"
                                  >
                                    <button
                                      onClick={() =>
                                        toggleAccess(student._id, status)
                                      }
                                      className={`w-full flex items-center gap-2 px-4 py-3 text-xs font-black transition-all hover:bg-slate-50 dark:hover:bg-zinc-700 ${
                                        status === "active"
                                          ? "text-red-500"
                                          : "text-emerald-600 dark:text-emerald-400"
                                      }`}
                                    >
                                      {status === "active" ? (
                                        <>
                                          <ShieldOff size={13} /> Revoke Access
                                        </>
                                      ) : (
                                        <>
                                          <ShieldCheck size={13} /> Grant Access
                                        </>
                                      )}
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Backdrop */}
      {openMenu !== null && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
      )}
    </div>
  );
}
