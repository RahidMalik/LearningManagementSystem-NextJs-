"use client";

import { useState, useEffect } from "react";
import {
  Camera,
  Mail,
  User,
  BookOpen,
  ChevronRight,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newName, setNewName] = useState("");

  // --- Fetch Data from MongoDB ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        if (res.success) {
          setUser(res.user);
          setNewName(res.user.name);
        }
      } catch (error: any) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  // --- Update Profile Logic ---
  const handleUpdate = async () => {
    if (newName === user.name) return toast.error("No changes made");

    setIsUpdating(true);
    try {
      const res = await api.updateProfile({ name: newName });
      if (res.success) {
        setUser({ ...user, name: newName });
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={50} />
        <p className="text-slate-500 animate-pulse font-medium">
          Fetching from Database...
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 min-h-screen pb-24">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-[#0a348f] tracking-tight">
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- Left Column: Identity Card --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-50 border border-slate-50 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#0a348f]" />

            <div className="relative group">
              <div className="h-36 w-36 rounded-full overflow-hidden border-4 border-white shadow-2xl group-hover:brightness-75 transition-all">
                <Image
                  src={
                    user?.photoURL && user.photoURL.startsWith("http")
                      ? user.photoURL
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=random`
                  }
                  alt="Avatar"
                  width={144}
                  height={144}
                  className="object-cover h-full w-full"
                  priority
                  unoptimized
                />
              </div>
              <button className="absolute bottom-2 right-2 bg-[#0a348f] p-2 rounded-full text-white shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-bold text-slate-800">
                {user?.name}
              </h2>
              <p className="text-slate-400 flex items-center justify-center gap-1 text-sm font-medium">
                <Mail size={14} /> {user?.email}
              </p>
            </div>

            <div className="mt-6 w-full pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-[#0a348f]">02</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Courses
                </p>
              </div>
              <div className="text-center border-l border-slate-50">
                <p className="text-xl font-bold text-green-500">Active</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Status
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Settings & Courses --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Form */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User size={20} className="text-[#0a348f]" />
                </div>
                Account Settings
              </h3>
              <ShieldCheck className="text-green-500" size={24} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Display Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all focus:ring-[#0a348f]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Email (Private)
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <Input
                    value={user?.email}
                    disabled
                    className="h-14 pl-12 rounded-2xl bg-slate-100 border-none text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <Button
              disabled={isUpdating}
              onClick={handleUpdate}
              className="h-14 px-8 bg-[#0a348f] hover:bg-[#0d2a6b] rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 transition-all active:scale-95 gap-2"
            >
              {isUpdating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              Save Changes
            </Button>
          </section>

          {/* Learning Progress Section */}
          <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BookOpen size={20} className="text-orange-600" />
              </div>
              Current Learning
            </h3>

            <div className="space-y-4">
              {[
                {
                  title: "Graphic Design Masterclass",
                  progress: 65,
                  color: "bg-blue-500",
                },
                {
                  title: "MERN Stack Development",
                  progress: 25,
                  color: "bg-orange-500",
                },
              ].map((course, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-50 hover:border-blue-100 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700">
                      {course.title}
                    </span>
                    <ChevronRight
                      size={20}
                      className="text-slate-300 group-hover:text-[#0a348f] transition-all"
                    />
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${course.color}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                    <span>Progress</span>
                    <span className="text-[#0a348f]">
                      {course.progress}% Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
