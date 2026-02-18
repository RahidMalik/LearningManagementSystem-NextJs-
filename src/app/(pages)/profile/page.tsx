"use client";

import { useState } from "react";
import { Camera, Mail, User, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "Rahid Malik",
    email: "Rahid@example.com",
    avatar: "/api/placeholder/150/150",
  });

  // Example enrolled courses list
  const enrolledCourses = [
    { id: "1", title: "Graphic Design Masterclass", progress: 65 },
    { id: "2", title: "Full Stack Web Dev (MERN)", progress: 20 },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 min-h-screen pb-20">
      <h1 className="text-3xl font-extrabold text-[#0a348f]">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- Left Column: Avatar & Quick Info --- */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#0a348f]/10 shadow-lg">
                <Image
                  src={user.avatar}
                  alt="Avatar"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white" size={24} />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <div className="mt-4 px-3 py-1 bg-blue-50 text-[#0a348f] text-xs font-bold rounded-full uppercase tracking-wider">
              Student
            </div>
          </div>
        </div>

        {/* --- Right Column: Edit Profile & Courses --- */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Form */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User size={18} className="text-[#0a348f]" /> Personal Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Full Name
                </label>
                <Input
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="rounded-xl border-slate-200 focus:ring-[#0a348f]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <Input
                    value={user.email}
                    disabled
                    className="pl-10 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Email cannot be changed.
                </p>
              </div>
              <Button className="bg-[#0a348f] hover:bg-blue-800 rounded-xl w-full md:w-auto">
                Save Changes
              </Button>
            </div>
          </section>

          {/* Enrolled Courses Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-[#0a348f]" /> My Learning
              Status
            </h3>

            {enrolledCourses.length > 0 ? (
              <div className="space-y-3">
                {enrolledCourses.map((course) => (
                  <Link key={course.id} href={`/course/${course.id}`}>
                    <div className="flex items-center justify-between p-3 border border-slate-50 hover:bg-slate-50 rounded-xl transition-colors group">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700">
                          {course.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="bg-[#0a348f] h-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-bold">
                            {course.progress}% done
                          </span>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className="text-slate-300 group-hover:text-[#0a348f] transition-all"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">
                  You haven't enrolled in any courses yet.
                </p>
                <Link href="/explore">
                  <Button variant="link" className="text-[#0a348f] font-bold">
                    Browse Courses
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
