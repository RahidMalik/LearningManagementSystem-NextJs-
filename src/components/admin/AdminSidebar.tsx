"use client";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin" },
    { icon: <BookOpen size={20} />, label: "Courses", href: "/admin/courses" },
    { icon: <Users size={20} />, label: "Students", href: "/admin/students" },
    {
      icon: <Settings size={20} />,
      label: "Settings",
      href: "/admin/account-settings",
    },
  ];

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="h-10 w-10 bg-[#0a348f] rounded-xl flex items-center justify-center text-white font-bold italic text-xl">
          A
        </div>
        <span className="font-black text-xl tracking-tight text-slate-800">
          ADMIN PANEL
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, i) => {
          // Check karega ke current page konsa hai taake blue color show ho
          const isActive = pathname === item.href;
          return (
            <Link key={i} href={item.href}>
              <div
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all mb-1 ${
                  isActive
                    ? "bg-[#0a348f] text-white shadow-lg shadow-blue-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                <span className="font-bold">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <button className="flex items-center gap-4 p-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all mt-auto">
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
}
