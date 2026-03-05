"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Save, User, Settings, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/services/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: any = await api.getProfile();
        //  Same logic as Sidebar to get user data perfectly
        const user = res?.user || res?.data?.user || res?.data || res;

        if (user) {
          setName(user?.name || "");
          setEmail(user?.email || "");
          //  Extract image safely like sidebar
          const img = user?.photoURL || user?.avatar || user?.image || "";
          setPhoto(img);
        }
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateProfile({ name, photoURL: photo });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const inp =
    "w-full p-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0a348f] dark:focus:border-blue-500 transition-all";
  const lbl =
    "block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5";

  return (
    <div className="flex min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* ── Header ── */}
        <div className="sticky top-0 z-30 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 sm:px-8 py-4 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-[#0a348f] dark:text-blue-400" />
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                Manage your admin profile
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="max-w-lg mx-auto space-y-5">
            {/* ── Avatar card ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 transition-colors duration-300">
              <div className="relative">
                {photo ? (
                  <img
                    src={photo}
                    alt={name}
                    className="w-20 h-20 rounded-3xl object-cover border border-slate-200 dark:border-zinc-700 shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                    <span className="text-slate-400 dark:text-zinc-500 font-black text-2xl uppercase">
                      {name ? name.charAt(0) : "A"}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="font-black text-slate-900 dark:text-white text-base">
                  {name || "Admin"}
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                  {email || "admin@lms.com"}
                </p>
              </div>
            </div>

            {/* ── Form card ── */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
              <p className="text-[10px] font-black text-[#0a348f] dark:text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <User size={11} /> Profile Information
              </p>

              <div className="space-y-4">
                {/* Name — editable */}
                <div>
                  <label className={lbl}>Admin Name</label>
                  <input
                    type="text"
                    className={inp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                {/* Email — disabled */}
                <div>
                  <label className={lbl}>
                    Email
                    <span className="ml-2 normal-case font-semibold text-slate-400 dark:text-zinc-500">
                      (cannot be changed)
                    </span>
                  </label>
                  <input
                    type="email"
                    className={
                      inp +
                      " opacity-60 cursor-not-allowed select-none bg-slate-50 dark:bg-zinc-800/50"
                    }
                    value={email}
                    disabled
                  />
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1.5 ml-1">
                    Email is tied to your .env config. Contact server admin to
                    update.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Save button ── */}
            <motion.button
              onClick={handleSave}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-[#0a348f] dark:bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-200 dark:shadow-none flex items-center justify-center gap-2 hover:bg-blue-800 dark:hover:bg-blue-500 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Saving...
                </span>
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
}
