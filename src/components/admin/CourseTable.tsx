"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  Users,
  BookOpen,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

const categoryColors: Record<string, string> = {
  "Web Development":
    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
  "App Development":
    "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20",
  "Graphic Design":
    "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/20",
  "Digital Marketing":
    "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
  Photography:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
  Business:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
};

const getColor = (category: string) =>
  categoryColors[category] ||
  "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700";

const formatRevenue = (n: number) => {
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `PKR ${(n / 1000).toFixed(1)}K`;
  return `PKR ${n}`;
};

export default function CourseTable() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [statsMap, setStatsMap] = useState<
    Record<string, { students: number; revenue: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"students" | "revenue" | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Courses
        const cRes: any = await api.getAllCourses();
        const allCourses = cRes?.courses || cRes?.data?.courses || [];
        setCourses(allCourses);

        // Per-course stats
        const sRes: any = await api.getCourseStats();
        setStatsMap(sRes?.data?.stats || sRes?.stats || {});
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const enriched = courses.map((c) => ({
    ...c,
    students: statsMap[c._id]?.students || 0,
    revenue: statsMap[c._id]?.revenue || 0,
  }));

  const sorted = [...enriched].sort((a, b) => {
    if (sortBy === "students") return b.students - a.students;
    if (sortBy === "revenue") return b.revenue - a.revenue;
    return 0;
  });

  const menuRef = useRef<HTMLDivElement>(null);

  // outside click close when user click on MenuVertical
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setOpenMenu(null);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Show top 5 only in dashboard
  const display = sorted.slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#0a348f] dark:text-blue-400" />
          <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">
            Recent Courses
          </h3>
          <span className="text-slate-500 dark:text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-50 dark:bg-zinc-800">
            {courses.length}
          </span>
        </div>
        <button
          onClick={() => router.push("/admin/courses")}
          className="text-[#0a348f] dark:text-blue-400 font-bold text-xs hover:underline"
        >
          View All →
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2
            size={28}
            className="animate-spin text-[#0a348f] dark:text-blue-400"
          />
          <p className="text-xs font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
            Loading...
          </p>
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <BookOpen size={28} className="text-slate-200 dark:text-zinc-700" />
          <p className="text-xs font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
            No courses yet
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-zinc-800">
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Category
                </th>
                <th
                  className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                  onClick={() =>
                    setSortBy(sortBy === "students" ? null : "students")
                  }
                >
                  <span className="flex items-center gap-1">
                    Students <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                  Badge
                </th>
                <th
                  className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-slate-600 dark:hover:text-zinc-300 transition-colors"
                  onClick={() =>
                    setSortBy(sortBy === "revenue" ? null : "revenue")
                  }
                >
                  <span className="flex items-center gap-1">
                    Revenue <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/80">
              {display.map((course) => (
                <tr
                  key={course._id}
                  className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors group"
                >
                  {/* Course */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt="course thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen size={14} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 max-w-40">
                        {course.title}
                      </span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getColor(course.category)}`}
                    >
                      {course.category}
                    </span>
                  </td>

                  {/* Students */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300">
                      <Users
                        size={13}
                        className="text-slate-400 dark:text-zinc-500"
                      />
                      <span className="font-bold text-sm">
                        {course.students}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <span className="font-black text-sm text-slate-800 dark:text-white">
                      PKR {Number(course.price).toLocaleString()}
                    </span>
                  </td>

                  {/* Badge */}
                  <td className="px-6 py-4">
                    {course.badge ? (
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg">
                        {course.badge}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 dark:text-zinc-600">
                        —
                      </span>
                    )}
                  </td>

                  {/* Revenue */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRevenue(course.revenue)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div
                      ref={openMenu === course._id ? menuRef : null}
                      className="relative flex justify-end"
                    >
                      {/* Trigger button */}
                      <button
                        onClick={() =>
                          setOpenMenu(
                            openMenu === course._id ? null : course._id,
                          )
                        }
                        className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors ${
                          openMenu === course._id
                            ? "opacity-100 bg-slate-100 dark:bg-zinc-700"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        <MoreVertical
                          size={15}
                          className="text-slate-400 dark:text-zinc-500"
                        />
                      </button>

                      {/* Dropdown — fixed se bahar nikala, table overflow se azad */}
                      {openMenu === course._id && (
                        <>
                          {/* Backdrop — invisible, click pe band */}
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenu(null)}
                          />
                          {/* Menu */}
                          <div className="absolute right-0 top-8 z-50 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-2xl overflow-hidden w-36">
                            <button
                              onClick={() => {
                                router.push(`/admin/courses`);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Eye size={13} className="text-blue-500" /> View
                            </button>
                            <button
                              onClick={() => {
                                router.push(`/admin/courses`);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                            >
                              <Edit2 size={13} className="text-amber-500" />{" "}
                              Edit
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm("Delete this course?")) return;
                                try {
                                  await api.deleteCourse(course._id);
                                  setCourses((prev) =>
                                    prev.filter((c) => c._id !== course._id),
                                  );
                                  setOpenMenu(null);
                                  toast.success("Course deleted!");
                                } catch {
                                  toast.error("Failed to delete");
                                }
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
