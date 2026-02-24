"use client";
import { useState, useEffect } from "react";
import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { api } from "@/services/api";

export interface ICourse {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  image: string;
}

export default function StudentDashboard() {
  // 1. Frontend Logic States
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Data Fetching Logic (Effect)
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const res = await api.getMyCourses();

        if (res.success && res.data) {
          const formattedData = res.data.map((course: any) => ({
            ...course,
            id: course._id,
          }));

          setCourses(formattedData);
        } else {
          setCourses([]);
        }
      } catch (err: any) {
        setError("Failed to load your courses.");
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

  if (courses.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-50 space-y-4">
        <div className="p-6 bg-blue-100 text-blue-600 rounded-full">
          <BookOpen size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-700">No Courses Yet</h2>
        <p className="text-slate-500">You haven't enrolled in any courses.</p>
        <Link
          href="/courses"
          className="px-6 py-3 bg-[#0a348f] text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-lg"
        >
          Explore Courses
        </Link>
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
