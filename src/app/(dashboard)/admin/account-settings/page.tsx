"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Save, Bell, Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Settings updated successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black italic uppercase text-slate-900">
            Admin Settings
          </h1>
          <p className="text-slate-500 font-medium">
            Configure your platform's global preferences
          </p>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-[#0a348f] mb-2">
                <User size={20} />
                <h2 className="font-bold uppercase tracking-wider">
                  Profile Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#0a348f]"
                    defaultValue="Rahid Malik"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-slate-400 ml-1">
                    Public Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-slate-50 border-none p-4 rounded-2xl focus:ring-2 focus:ring-[#0a348f]"
                    defaultValue="admin@lms.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 text-[#0a348f] mb-2">
                <Shield size={20} />
                <h2 className="font-bold uppercase tracking-wider">
                  Security Settings
                </h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-800">
                    Two-Factor Authentication
                  </p>
                  <p className="text-xs text-slate-500">
                    Secure your admin account
                  </p>
                </div>
                <button className="w-12 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Actions */}
          <div className="space-y-4">
            <div className="bg-[#0a348f] p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <p className="text-blue-200 text-sm mb-6">
                Don't forget to save your changes before leaving the panel.
              </p>
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-white text-[#0a348f] py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} /> Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
