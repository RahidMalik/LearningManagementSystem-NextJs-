"use client";

import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  PlayCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";

const CARD_STYLES = [
  {
    label: "Total Students",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-500/20",
    shadow: "shadow-blue-100 dark:shadow-blue-900/20",
    barWidth: "72%",
  },
  {
    label: "Total Revenue",
    icon: DollarSign,
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-500/20",
    shadow: "shadow-emerald-100 dark:shadow-emerald-900/20",
    barWidth: "58%",
  },
  {
    label: "Active Courses",
    icon: PlayCircle,
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    border: "border-violet-100 dark:border-violet-500/20",
    shadow: "shadow-violet-100 dark:shadow-violet-900/20",
    barWidth: "45%",
  },
];

export default function AdminStats() {
  const [students, setStudents] = useState<number | null>(null);
  const [revenue, setRevenue] = useState<number | null>(null);
  const [courses, setCourses] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      // ── 1. Courses ──
      try {
        const cRes: any = await api.getAllCourses();
        const allCourses = cRes?.courses || cRes?.data?.courses || [];
        setCourses(allCourses.length);
      } catch {
        setCourses(0);
      }

      // ── 2. Students ──
      try {
        const sRes: any = await api.getAllStudents(1, 10);
        const total =
          sRes?.data?.totalStudents ??
          sRes?.totalStudents ??
          sRes?.data?.data?.length ??
          0;
        setStudents(total);
      } catch {
        setStudents(0);
      }

      // ── 3. Revenue ──
      try {
        const rRes: any = await api.getAdminRevenue();
        const totalRevenue =
          rRes?.data?.totalRevenue ?? rRes?.totalRevenue ?? 0;
        setRevenue(totalRevenue);
      } catch {
        setRevenue(0);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  const formatRevenue = (n: number) => {
    if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
    if (n >= 1000) return `PKR ${(n / 1000).toFixed(1)}K`;
    return `PKR ${n}`;
  };

  const formatStudents = (n: number) => {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
  };

  const values = [
    students !== null ? formatStudents(students) : null,
    revenue !== null ? formatRevenue(revenue) : null,
    courses !== null ? String(courses) : null,
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {CARD_STYLES.map((stat, i) => {
        const Icon = stat.icon;
        const value = values[i];
        return (
          <div
            key={i}
            className={`relative border ${stat.border} rounded-3xl p-6 shadow-sm ${stat.shadow} overflow-hidden group hover:-translate-y-1 transition-all duration-300`}
          >
            <div
              className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-linear-to-br ${stat.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300`}
            />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.bg} border ${stat.border}`}
                >
                  <Icon size={22} className={stat.iconColor} />
                </div>
                {loading ? (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${stat.bg} border ${stat.border}`}
                  >
                    <Loader2
                      size={10}
                      className={`${stat.iconColor} animate-spin`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <TrendingUp size={10} className="text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">
                      Live
                    </span>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {loading || value === null ? (
                  <span className="inline-block h-7 w-24 bg-slate-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ) : (
                  value
                )}
              </h3>
              <p className="text-slate-400 dark:text-zinc-500 text-xs font-semibold mt-1 uppercase tracking-wider">
                {stat.label}
              </p>
              <div className="mt-4 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-linear-to-r ${stat.gradient} rounded-full transition-all duration-700`}
                  style={{ width: loading ? "0%" : stat.barWidth }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
