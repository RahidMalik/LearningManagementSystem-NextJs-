"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";
import { Loader2, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import { api } from "@/services/api";

export interface ICourse {
  id: string;
  title: string;
  instructor: string;
  image: string;
  price?: number;
  category?: string;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardCourses = async () => {
      try {
        setLoading(true);

        const res: any = await api.getAllCourses();

        const coursesArray = res.courses || res.data?.courses || [];

        if (coursesArray.length > 0) {
          const formattedData = coursesArray.map((c: any) => ({
            id: c._id || c.id,
            title: c.title,
            instructor: c.instructor || "Rahid",
            image:
              c.thumbnail ||
              c.image ||
              "https://placehold.co/600x400?text=Course",
            price: c.price,
            category: c.category,
          }));
          setCourses(formattedData);
        }
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        setError("Failed to load available courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={48} />
        <p className="text-slate-500 font-medium">
          Discovering new courses for you...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#0a348f] tracking-tight">
            Explore Courses
          </h1>
          <p className="text-slate-500 text-lg">
            Ready to learn something new? We have{" "}
            <span className="font-bold text-slate-700">{courses.length}</span>{" "}
            programs available.
          </p>
        </div>

        <Link
          href="/course"
          className="group flex items-center gap-2 text-[#0a348f] font-bold hover:text-blue-800 transition-all"
        >
          View Full Catalog
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Grid - Only showing first 8 */}
      {courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4  gap-6">
          {courses.slice(0, 8).map((course) => (
            <Link
              href={`/course/${course.id}`}
              key={course.id}
              className="block transition-all hover:scale-[1.02] active:scale-95"
            >
              <CourseCard {...course} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-20">
          <BookOpen size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500">No courses found in the catalog.</p>
        </div>
      )}

      {/* Show more button if courses > 8 */}
      {courses.length > 8 && (
        <div className="flex justify-center pt-8">
          <Link
            href="/course"
            className="px-8 py-3 border-2 border-[#0a348f] text-[#0a348f] font-bold rounded-2xl hover:bg-[#0a348f] hover:text-white transition-all shadow-sm"
          >
            Show All {courses.length} Courses
          </Link>
        </div>
      )}
    </div>
  );
}
