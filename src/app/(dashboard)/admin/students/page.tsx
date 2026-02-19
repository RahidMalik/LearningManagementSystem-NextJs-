"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { User, Mail, ShieldCheck } from "lucide-react";

export default function AdminStudents() {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-black uppercase italic mb-8">
          Students List
        </h1>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 text-left">Student Info</th>
                <th className="px-8 py-5 text-left">Enrollment Date</th>
                <th className="px-8 py-5 text-left">Account Status</th>
                <th className="px-8 py-5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3].map((i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <div className="h-10 w-10 bg-[#0a348f]/10 text-[#0a348f] rounded-full flex items-center justify-center font-bold">
                      S{i}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">
                        Student Name {i}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        student{i}@example.com
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">
                    1{i} Feb, 2026
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-green-500 font-bold text-xs flex items-center gap-1">
                      <ShieldCheck size={14} /> Verified
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-xs font-bold text-[#0a348f] hover:underline">
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
