"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStats from "@/components/admin/AdminStats";
import CourseTable from "@/components/admin/CourseTable";
import { Bell, Search } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
              Dashboard
            </h1>
            <p className="text-slate-500 font-medium">
              Overveiw of your platform performance
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 relative">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </div>
        <AdminStats />
        <div className="mt-10">
          <CourseTable />
        </div>
      </main>
    </div>
  );
}
