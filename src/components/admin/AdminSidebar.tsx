"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "@/services/api";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Users, label: "Students", href: "/admin/students" },
  { icon: Settings, label: "Settings", href: "/admin/account-settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminProfile = async () => {
      try {
        const res: any = await api.getProfile();
        const user = res?.user || res?.data?.user || res?.data || res;
        if (user && isMounted) {
          setAdminData(user);
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      }
    };
    fetchAdminProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  // Safely extract the image URL
  const rawImg = adminData?.photoURL || adminData?.avatar || adminData?.image;
  // Agar API se image aaye, aur error na aaya ho, toh show karein
  const showImage = rawImg && !imgError;
  const adminName = adminData?.name || "LMS Admin";
  const adminEmail = adminData?.email || "admin@lms.com";

  const sidebarContent = (
    <>
      {/* ── Top Logo Area ── */}
      <div className="px-6 py-6 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          {showImage ? (
            <div className="h-10 w-10 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700 shadow-sm">
              <img
                src={typeof rawImg === "string" ? rawImg : "/placeholder.jpg"}
                alt="Admin"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 dark:border-zinc-700 ">
              <GraduationCap
                size={20}
                className="text-[#0a348f] dark:text-blue-400"
              />
            </div>
          )}
          <div>
            <p className="font-black text-sm text-slate-900 dark:text-white tracking-tight leading-none truncate w-32">
              {adminName}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
              Management Panel
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav Menu ── */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.15em] px-3 mb-3">
          Main Menu
        </p>
        {menuItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              <div
                className={`flex items-center gap-3 px-3 mb-2 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 group ${
                  isActive
                    ? "bg-[#0a348f] text-white shadow-lg shadow-blue-200/60 dark:shadow-blue-900/30"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-[#2c58b8] hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-white/20"
                      : "bg-slate-100 dark:bg-zinc-800 group-hover:bg-slate-200 dark:group-hover:bg-zinc-700"
                  }`}
                >
                  <Icon
                    size={15}
                    className={
                      isActive
                        ? "text-white"
                        : "text-slate-500 dark:text-[#2266f9]"
                    }
                  />
                </div>
                <span className="font-bold text-sm flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="text-white/60" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Profile Area ── */}
      <div className="px-4 py-5 border-t border-slate-100 dark:border-zinc-800 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-zinc-700">
            {showImage ? (
              <img
                src={typeof rawImg === "string" ? rawImg : "/placeholder.jpg"}
                alt="Admin"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800">
                <span className="text-slate-400 font-black text-xs uppercase">
                  {adminName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-white truncate">
              {adminName}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
              {adminEmail}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 font-bold text-sm rounded-2xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95 group relative"
        >
          <div className="p-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 group-hover:bg-white dark:group-hover:bg-red-500/20 group-hover:shadow-sm border border-transparent group-hover:border-red-100 dark:group-hover:border-red-500/20 transition-all duration-300">
            <LogOut
              size={16}
              className="text-red-600 dark:text-red-400 transition-transform duration-300 group-hover:-translate-x-0.5"
            />
          </div>
          <span className="flex-1 text-left transition-transform duration-300 group-hover:translate-x-1">
            Logout
          </span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:flex w-64  border-r border-slate-100 dark:border-zinc-800 h-screen sticky top-0 flex-col shrink-0 transition-colors duration-300">
        {sidebarContent}
      </aside>

      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-1.5 border right-4 z-50 p-2.5 rounded-2xl shadow-lg bg-white dark:bg-zinc-900"
      >
        <Menu size={25} className="text-[#0a348f] dark:text-blue-400" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
        >
          <X size={18} className="text-slate-500 dark:text-zinc-400" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
