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
} from "lucide-react";
import { api } from "@/services/api";

export interface ICourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
}

export default function StudentDashboard() {
  const [courses, setCourses] = useState<ICourse[]>([]);
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
              id: item.course._id,
              title: item.course.title,
              instructor: item.course.instructor || "Admin",
              progress: item.progress || 0,
              image:
                item.course.thumbnail ||
                item.course.image ||
                "/default-course.png",
            }));
          setCourses(formattedData);
        } else {
          setCourses([]);
        }
      } catch (err: any) {
        const msg = err?.message?.toLowerCase() || "";
        // 404, not found, ya koi bhi API error = no courses, not a crash
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={48} />
        <p className="text-slate-500 font-medium">
          Loading your learning space...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0a348f] text-white rounded-lg hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ✅ User ne koi bhi course buy nahi kia
  if (courses.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <ShoppingBag size={40} className="text-[#0a348f]" />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">
              You did't buy any courses yet.
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Buy a course now and start learning.
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/course"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#0a348f] text-white rounded-2xl hover:bg-blue-800 transition-all font-bold shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:scale-95"
          >
            Explore Courses
            <ArrowRight size={18} />
          </Link>

          <p className="text-xs text-slate-400">
            7-day money-back guarantee • Lifetime access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-[#0a348f] tracking-tight">
          My Learning
        </h1>
        <p className="text-slate-500 text-lg">
          Welcome back! You have{" "}
          <span className="font-bold text-slate-700">{courses.length}</span>{" "}
          courses in progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            href={`/course/${course.id}`}
            key={course.id}
            className="block transition-all hover:scale-[1.03] hover:shadow-xl rounded-2xl"
          >
            <CourseCard {...course} />
          </Link>
        ))}
      </div>
    </div>
  );
}
