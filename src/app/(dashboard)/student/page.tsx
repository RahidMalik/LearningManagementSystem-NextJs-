"use client";

import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";

export default function StudentDashboard() {
  const myCourses = [
    {
      id: "1",
      title: "Graphic Design Masterclass",
      instructor: "Syed Hasnain",
      progress: 65,
      image: "/video/CourseVideo.png",
    },
    {
      id: "2",
      title: "Full Stack Web Dev (MERN)",
      instructor: "Cybex Team",
      progress: 20,
      image: "/video/CourseVideo.png",
    },
  ];

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0a348f]">My Learning</h1>
        <p className="text-slate-500">
          Welcome back, let's continue your courses.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myCourses.map((course) => (
          <Link
            href={`/course/${course.id}`}
            key={course.id}
            className="block transition-transform hover:scale-[1.02]"
          >
            <CourseCard {...course} />
          </Link>
        ))}
      </div>
    </div>
  );
}
