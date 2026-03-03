"use client";
import { useState, useEffect } from "react";
import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { api } from "@/services/api";

// ICourse interface humne already global/api se import ki hui thi,
// lekin backend API res.data.course ki form mein data bhejti hai My Courses mein
export default function StudentDashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMyCourses();

        if (res.success && res.data && res.data.length > 0) {
          const formattedData = res.data
            .filter((item: any) => item && item.course)
            .map((item: any) => ({
              // Nested course object se data extract kar rahe hain
              _id: item.course._id,
              title: item.course.title,
              instructor:
                item.course.instructorName || item.course.instructor || "Admin",
              instructorImage: item.course.instructorImage || null,
              progress: item.progress || 0, // <-- Yahan progress bheji ja rahi hai
              image:
                item.course.thumbnail ||
                item.course.image ||
                "https://placehold.co/600x400?text=Course",
              category: item.course.category || "Tech",
              price: Number(item.course.price) || 0,
              lectures: item.course.lectures || [],
            }));
          setCourses(formattedData);
        } else {
          setCourses([]);
        }
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || "";
        if (
          msg.includes("404") ||
          msg.includes("not found") ||
          msg.includes("no courses") ||
          msg.includes("api_error") ||
          msg === "" ||
          msg === "something went wrong"
        ) {
          setCourses([]);
        } else {
          setError("Something went wrong while fetching courses.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 space-y-4">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400"
          size={48}
        />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Loading your learning space...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4 text-center px-4 bg-slate-50 dark:bg-slate-900 transition-colors">
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
          className="mt-4 bg-[#0a348f] hover:bg-blue-800 text-white rounded-xl h-12 px-8"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors">
                <ShoppingBag
                  size={40}
                  className="text-[#0a348f] dark:text-blue-400"
                />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 dark:bg-amber-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                <Sparkles
                  size={16}
                  className="text-white dark:text-amber-100"
                />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              You haven't bought any courses yet.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Buy a course now and start learning to achieve your goals.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/course"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a348f] dark:bg-blue-600 text-white rounded-2xl hover:bg-blue-800 dark:hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:-translate-y-0.5 active:scale-95"
          >
            Explore Courses
            <ArrowRight size={18} />
          </Link>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            7-day money-back guarantee • Lifetime access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-10 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] transition-colors duration-300">
      {/* Header Section (All Courses jaisa hi banaya hai) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#0a348f] dark:text-blue-400 flex items-center gap-3 tracking-tight uppercase">
            <BookOpen className="text-blue-600 dark:text-blue-500" size={32} />
            My Learning
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Welcome back! You have{" "}
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              {courses.length}
            </span>{" "}
            courses in progress.
          </p>
        </div>
      </div>

      {/* Courses Grid (All Courses ki tarah responsive aur beautiful) */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map((course) => (
          <div
            key={course._id}
            className="block transition-all duration-300 hover:scale-[1.03] hover:z-10 focus-within:ring-4 focus-within:ring-blue-500/50 rounded-[32px] h-full"
          >
            <CourseCard
              _id={course._id}
              title={course.title}
              instructor={course.instructor}
              instructorImage={course.instructorImage}
              image={course.image}
              category={course.category}
              price={course.price}
              lectures={course.lectures}
              progress={course.progress}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
