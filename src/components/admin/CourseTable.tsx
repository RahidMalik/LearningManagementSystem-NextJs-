"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  ArrowUpDown,
  Users,
  BookOpen,
} from "lucide-react";

const courses = [
  {
    id: 1,
    name: "Graphic Design Masterclass",
    category: "Design",
    students: 450,
    price: "PKR 7,200",
    status: "Active",
    revenue: "PKR 3,24,000",
  },
  {
    id: 2,
    name: "Full Stack Development",
    category: "Dev",
    students: 320,
    price: "PKR 15,000",
    status: "Active",
    revenue: "PKR 48,00,000",
  },
  {
    id: 3,
    name: "UI/UX Bootcamp",
    category: "Design",
    students: 180,
    price: "PKR 8,900",
    status: "Draft",
    revenue: "PKR 16,02,000",
  },
  {
    id: 4,
    name: "Digital Marketing Pro",
    category: "Marketing",
    students: 95,
    price: "PKR 5,500",
    status: "Active",
    revenue: "PKR 5,22,500",
  },
  {
    id: 5,
    name: "Photography Basics",
    category: "Media",
    students: 210,
    price: "PKR 3,200",
    status: "Draft",
    revenue: "PKR 6,72,000",
  },
];

const categoryColors: Record<string, string> = {
  Design:
    "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20",
  Dev: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
  Marketing:
    "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
  Media:
    "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-500/20",
};

export default function CourseTable() {
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"students" | "price" | null>(null);

  const sorted = [...courses].sort((a, b) => {
    if (sortBy === "students") return b.students - a.students;
    return 0;
  });

  return (
    <div>
      {/* Table header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-[#0a348f] dark:text-blue-400" />
          <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">
            Recent Courses
          </h3>
          <span className="text-slate-500 dark:text-zinc-400 text-[10px] font-black px-2 py-0.5 rounded-full">
            {courses.length}
          </span>
        </div>
        <button
          onClick={() => router.push("/admin/courses")}
          className="text-[#0a348f] dark:text-blue-400 font-bold text-xs hover:underline flex items-center gap-1"
        >
          View All →
        </button>
      </div>

      {/* Table */}
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
                Status
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                Revenue
              </th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y ">
            {sorted.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors group"
              >
                {/* Course name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#0a348f]/10 to-blue-400/10 dark:from-blue-500/20 dark:to-blue-400/10 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-500/20">
                      <BookOpen
                        size={14}
                        className="text-[#0a348f] dark:text-blue-400"
                      />
                    </div>
                    <span className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">
                      {course.name}
                    </span>
                  </div>
                </td>

                {/* Category */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase border ${categoryColors[course.category] || "bg-slate-50 text-slate-500"}`}
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
                      {course.students.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Price */}
                <td className="px-6 py-4">
                  <span className="font-black text-sm text-slate-800 dark:text-white">
                    {course.price}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${course.status === "Active" ? "bg-green-400 animate-pulse" : "bg-amber-400"}`}
                    />
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider ${
                        course.status === "Active"
                          ? "text-green-600 dark:text-green-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                </td>

                {/* Revenue */}
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {course.revenue}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === course.id ? null : course.id)
                    }
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical
                      size={15}
                      className="text-slate-400 dark:text-zinc-500"
                    />
                  </button>

                  {openMenu === course.id && (
                    <div className="absolute right-6 top-10 z-20 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden w-36">
                      <button
                        onClick={() => {
                          router.push(`/admin/courses/${course.id}`);
                          setOpenMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Eye size={13} className="text-blue-500" /> View
                      </button>
                      <button
                        onClick={() => {
                          router.push(`/admin/courses/${course.id}/edit`);
                          setOpenMenu(null);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Edit2 size={13} className="text-amber-500" /> Edit
                      </button>
                      <button
                        onClick={() => setOpenMenu(null)}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
