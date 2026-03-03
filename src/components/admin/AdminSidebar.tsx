"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-linear-to-br from-[#0a348f] to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/30 shrink-0">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-sm text-slate-900 dark:text-white tracking-tight leading-none">
              LMS Admin
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
              Management Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.15em] px-3 mb-3">
          Main Menu
        </p>
        {menuItems.map(({ icon: Icon, label, href }) => {
          const isActive =
            pathname === href ||
            (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={`
                flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 group
                ${
                  isActive
                    ? "bg-[#0a348f] text-white shadow-lg shadow-blue-200/60 dark:shadow-blue-900/30"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-white"
                }
              `}
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
                        : "text-slate-500 dark:text-zinc-400"
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

      {/* Bottom */}
      <div className="px-4 py-5 border-t border-slate-100 dark:border-zinc-800 space-y-3">
        {/* Admin info */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-[#0a348f] to-blue-400 flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xs">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 dark:text-white truncate">
              Admin
            </p>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">
              admin@lms.com
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 dark:text-red-400 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all group"
        >
          <div className="p-1.5 rounded-xl bg-red-50 dark:bg-red-500/10 group-hover:bg-red-100 dark:group-hover:bg-red-500/20 transition-colors">
            <LogOut size={15} className="text-red-500 dark:text-red-400" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  );
}
