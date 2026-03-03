"use client";

import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Mail,
  User,
  BookOpen,
  ChevronRight,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data from MongoDB ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const userData = res?.success ? res.user : res?.data?.user;
        if (userData) {
          setUser(userData);
          setNewName(userData.name);
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
      const res = await api.updateProfile({
        name: newName,
        photoURL: user.photoURL || "",
      });
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

  // --- Handle Photo Upload ---
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    const toastId = toast.loading("Uploading photo...");

    try {
      const res = await api.UpdateProfilePhoto(file);
      if (res.success) {
        setUser(res.user);
        setPreviewUrl(null);
        toast.success("Photo updated successfully!", { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo", { id: toastId });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400"
          size={50}
        />
        <p className="text-slate-500 dark:text-slate-400 animate-pulse font-medium">
          Fetching from Database...
        </p>
      </div>
    );

  return (
    <div className="max-w-full mx-auto p-4 md:p-10 space-y-10 min-h-[calc(100vh-4rem)] pb-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-black text-[#0a348f] dark:text-blue-400 tracking-tight transition-colors">
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- Left Column: Identity Card --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-blue-50 dark:shadow-none border border-slate-50 dark:border-slate-700 flex flex-col items-center text-center relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#0a348f] dark:bg-blue-500" />

            <div className="relative group mt-2">
              <div className="h-36 w-36 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-2xl group-hover:brightness-75 transition-all">
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
                <img
                  src={
                    previewUrl ||
                    (user?.photoURL && user.photoURL.trim() !== ""
                      ? user.photoURL
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0a348f&color=fff&size=200`)
                  }
                  alt={user?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0a348f&color=fff&size=200`;
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-[#0a348f] dark:bg-blue-600 p-2 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 transition-colors">
                {user?.name}
              </h2>
              <p className="text-slate-400 flex items-center justify-center gap-1 text-sm font-medium">
                <Mail size={14} /> {user?.email}
              </p>
            </div>

            <div className="mt-6 w-full pt-6 border-t border-slate-50 dark:border-slate-700 grid grid-cols-2 gap-4 transition-colors">
              <div className="text-center">
                <p className="text-xl font-bold text-[#0a348f] dark:text-blue-400">
                  02
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Courses
                </p>
              </div>
              <div className="text-center border-l border-slate-50 dark:border-slate-700 transition-colors">
                <p className="text-xl font-bold text-green-500 dark:text-green-400">
                  Active
                </p>
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
          <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition-colors">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <User
                    size={20}
                    className="text-[#0a348f] dark:text-blue-400"
                  />
                </div>
                Account Settings
              </h3>
              <ShieldCheck
                className="text-green-500 dark:text-green-400"
                size={24}
              />
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
                    className="h-14 pl-12 rounded-2xl border-slate-100 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50 focus:bg-white dark:focus:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all focus:ring-[#0a348f] dark:focus:ring-blue-500"
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
                    className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-700 border-none text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <Button
              disabled={isUpdating}
              onClick={handleUpdate}
              className="group relative h-14 px-8 w-full sm:w-auto overflow-hidden rounded-2xl bg-linear-to-r from-[#0a348f] to-blue-600 dark:from-blue-600 dark:to-blue-400 font-bold text-lg text-white shadow-[0_8px_25px_-8px_rgba(10,52,143,0.5)] dark:shadow-[0_8px_25px_-8px_rgba(59,130,246,0.4)] transition-all duration-300 hover:shadow-[0_15px_35px_-10px_rgba(10,52,143,0.6)] dark:hover:shadow-[0_15px_35px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1 active:scale-95 active:translate-y-0 border-none"
            >
              {/* Hover par Shine / Reflection Effect */}
              <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>

              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-center gap-2">
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save
                      className="group-hover:scale-110 transition-transform duration-300"
                      size={22}
                    />
                    <span>Save Changes</span>
                  </>
                )}
              </div>
            </Button>
          </section>

          {/* Learning Progress Section */}
          <section className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 space-y-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3 transition-colors">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <BookOpen
                  size={20}
                  className="text-orange-600 dark:text-orange-400"
                />
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
                  className="p-5 rounded-2xl border border-slate-50 dark:border-slate-700 hover:border-blue-100 dark:hover:border-slate-600 dark:bg-slate-700/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-slate-700 dark:text-slate-200 transition-colors">
                      {course.title}
                    </span>
                    <ChevronRight
                      size={20}
                      className="text-slate-300 dark:text-slate-500 group-hover:text-[#0a348f] dark:group-hover:text-blue-400 transition-all"
                    />
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden transition-colors">
                    <div
                      className={`h-full transition-all duration-1000 ${course.color}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-tighter transition-colors">
                    <span>Progress</span>
                    <span className="text-[#0a348f] dark:text-blue-400">
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
