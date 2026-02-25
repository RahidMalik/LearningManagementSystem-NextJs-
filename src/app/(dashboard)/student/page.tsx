"use client";

import { useState, useEffect } from "react";
import { CourseCard } from "@/components/shared/CourseCard";
import Link from "next/link";
import { Loader2, AlertCircle, BookOpen, ArrowRight } from "lucide-react"; // ArrowRight add kiya
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
        const res = await api.getMyCourses();

        if (res.success && res.data && res.data.length > 0) {
          const formattedData = res.data.map((course: any) => ({
            ...course,
            id: course._id,
          }));
          setCourses(formattedData);
        } else {
          // Mock Data logic (Sirf testing ke liye)
          const mockData: ICourse[] = Array(10)
            .fill(null)
            .map((_, i) => ({
              id: `${i}`,
              title:
                i % 2 === 0
                  ? "Graphic Design Masterclass"
                  : "Full Stack Web Dev",
              instructor: "Cybex Team",
              progress: 40 + i * 5,
              image:
                i % 2 === 0
                  ? "/Tumbnailimages/GraphicDesign.png"
                  : "/Tumbnailimages/Uiux.png",
            }));
          setCourses(mockData);
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
        <Link
          href="/course"
          className="px-6 py-3 bg-[#0a348f] text-white rounded-xl hover:bg-blue-800 transition-all font-semibold shadow-lg"
        >
          Explore Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header with View All Link */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#0a348f] tracking-tight">
            My Learning
          </h1>
          <p className="text-slate-500 text-lg">
            Welcome back! You have{" "}
            <span className="font-bold text-slate-700">{courses.length}</span>{" "}
            courses in total.
          </p>
        </div>

        {/* View All Button */}
        <Link
          href="/course"
          className="group flex items-center gap-2 text-[#0a348f] font-bold hover:text-blue-800 transition-all"
        >
          View All Courses
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </Link>
      </div>

      {/* Grid - Only showing first 8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      {courses.length > 8 && (
        <div className="flex justify-center pt-8">
          <Link
            href="/course"
            className="px-8 py-3 border-2 border-[#0a348f] text-[#0a348f] font-bold rounded-2xl hover:bg-[#0a348f] hover:text-white transition-all"
          >
            Show All {courses.length} Courses
          </Link>
        </div>
      )}
    </div>
  );
}
