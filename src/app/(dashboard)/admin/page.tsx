"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStats from "@/components/admin/AdminStats";
import CourseTable from "@/components/admin/CourseTable";
import AdminPendingPayments from "@/components/admin/Adminpendingpayments";
import { TrendingUp, Calendar } from "lucide-react";
import AdminReviews from "@/components/admin/Adminreviews ";

export default function AdminDashboard() {
  const today = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {/* ── Top Header Bar ── */}
        <div className="sticky top-0 z-30 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp
                  size={18}
                  className="text-[#0a348f] dark:text-blue-400"
                />
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Calendar
                  size={11}
                  className="text-slate-400 dark:text-zinc-500"
                />
                <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  {today}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="px-8 py-8 space-y-8">
          {/* Welcome banner */}
          <div className="relative overflow-hidden bg-linear-to-r from-[#0a348f] to-blue-500 rounded-3xl px-8 py-6 shadow-xl shadow-blue-200 dark:shadow-blue-900/30">
            <div className="absolute right-0 top-0 w-64 h-full opacity-10">
              <div className="absolute top-4 right-8 w-32 h-32 rounded-full border-4 border-white" />
              <div className="absolute top-12 right-24 w-16 h-16 rounded-full border-2 border-white" />
              <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full border-4 border-white" />
            </div>
            <div className="relative z-10">
              <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">
                Welcome back
              </p>
              <h2 className="text-2xl font-black text-white">
                Good day, Admin
              </h2>
              <p className="text-blue-100/80 text-sm mt-1">
                Here's what's happening with your platform today.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Platform Overview
              </h2>
              <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium px-3 py-1 rounded-full">
                Last 30 days
              </span>
            </div>
            <AdminStats />
          </div>

          {/* Course Table */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Course Management
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
                  Live data
                </span>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <CourseTable />
            </div>
          </div>
          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-slate-200 dark:via-zinc-800 to-transparent" />

          {/* ── Wallet Payments Section ── */}
          <div className="rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm p-6">
            <AdminPendingPayments />
          </div>

          {/* Divider */}
          <div />
        </div>

        <AdminReviews />
      </main>
    </div>
  );
}
