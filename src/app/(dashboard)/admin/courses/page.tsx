"use client";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Plus, Edit, Trash2, ExternalLink, BookOpen } from "lucide-react";

export default function AdminCourses() {
  const courses = [
    {
      id: 1,
      name: "Next.js Mastery",
      price: "$199",
      students: 150,
      status: "Published",
    },
    {
      id: 2,
      name: "UI/UX for Beginners",
      price: "$49",
      students: 89,
      status: "Draft",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase italic">Courses</h1>
          <button className="bg-[#0a348f] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
            <Plus size={20} /> Create New
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-[#0a348f]">
                  <BookOpen />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {course.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {course.students} Students enrolled
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="font-black text-xl">{course.price}</span>
                <span
                  className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${course.status === "Published" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}
                >
                  {course.status}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
