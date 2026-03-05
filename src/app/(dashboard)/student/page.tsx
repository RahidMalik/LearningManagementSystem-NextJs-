"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";
import { Loader2, AlertCircle, BookOpen, ArrowRight } from "lucide-react";
import { api, ICourse } from "@/services/api";

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
            _id: c._id || c.id,
            title: c.title,
            instructor: c.instructor || c.instructorName || "Instructor",
            instructorImage: c.instructorImage || null,
            image:
              c.thumbnail ||
              c.image ||
              "https://placehold.co/600x400?text=Course",
            thumbnail: c.thumbnail || c.image || "",
            price: c.price,
            category: c.category,
            rating: c.rating || "0",
            lectures: Array.isArray(c.lectures) ? c.lectures : [],
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
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 space-y-4">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400"
          size={48}
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Discovering new courses for you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4 text-center px-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-full mb-2">
          <AlertCircle className="text-red-500 dark:text-red-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#0a348f] hover:bg-blue-800 text-white rounded-xl h-12 px-8 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0a348f] dark:text-blue-400 tracking-tight transition-colors">
            Explore Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-md transition-colors">
            Ready to learn something new? We have{" "}
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {courses.length}
            </span>{" "}
            programs available.
          </p>
        </div>

        <Link
          href="/course"
          className="group flex items-center gap-2 text-[#0a348f] dark:text-blue-400 font-bold hover:text-blue-800 dark:hover:text-blue-300 transition-all"
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
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.slice(0, 8).map((course) => (
            <Link
              href={`/course/${course._id}`}
              key={course._id}
              className="block transition-all hover:scale-[1.02] hover:z-10 focus-within:ring-4 focus-within:ring-blue-500/50 rounded-[32px] active:scale-95"
            >
              <CourseCard {...course} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <BookOpen
            size={60}
            className="text-slate-200 dark:text-slate-600 mb-4"
          />
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            No courses found in the catalog.
          </p>
        </div>
      )}

      {/* Show more button if courses > 8 */}
      {courses.length > 8 && (
        <div className="flex justify-center pt-8">
          <Link
            href="/course"
            className="px-8 py-3 border-2 border-[#0a348f] dark:border-blue-500 text-[#0a348f] dark:text-blue-400 font-bold rounded-2xl hover:bg-[#0a348f] dark:hover:bg-blue-600 hover:text-white dark:hover:text-white transition-all shadow-sm"
          >
            Show All {courses.length} Courses
          </Link>
        </div>
      )}
    </div>
  );
}
