"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  LayoutGrid,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, ICourse } from "@/services/api";
import { CourseCard } from "@/components/shared/CourseCard";

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 20;

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        setError(null); // Pehle purana error clear karein
        const res: any = await api.getAllCourses();

        const coursesArray = res.courses || res.data?.courses || [];

        if (Array.isArray(coursesArray)) {
          const formattedData = coursesArray.map((c: any) => ({
            ...c,
            _id: c._id?.toString() || c.id,
            image:
              c.thumbnail ||
              c.image ||
              "https://placehold.co/600x400?text=Course",
            category: c.category || "Development",
            progress: 50,
            price: Number(c.price) || 0,
            instructor: c.instructor || "Cybex Team",
            videoCount: c.lectures?.length || 0,
          }));
          setCourses(formattedData);
        }
      } catch (err: any) {
        // Agar koi masla ho toh error state me save karein
        setError(err.message || "Failed to fetch available courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllCourses();
  }, []);

  // --- Pagination Calculation ---
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Loading UI
  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={48} />
        <p className="text-slate-500 font-medium">Loading Course Catalog...</p>
      </div>
    );
  }

  // 2. Error UI (Yahan humne 'error' variable ko use kar liya hai)
  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="p-5 bg-red-50 rounded-full mb-2">
          <AlertCircle className="text-red-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">
          Oops! Something went wrong
        </h2>
        <p className="text-slate-500 font-medium max-w-md">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 bg-[#0a348f] hover:bg-blue-800 text-white rounded-xl h-12 px-8"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // 3. Main Content UI
  return (
    <div className="p-8 space-y-10 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#0a348f] flex items-center gap-3 tracking-tight uppercase">
            <LayoutGrid className="text-blue-600" size={32} />
            Explore Programs
          </h1>
          <p className="text-slate-500 text-lg">
            Choose from{" "}
            <span className="text-blue-600 font-bold">{courses.length}</span>{" "}
            professional courses
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      {currentCourses.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentCourses.map((course) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                instructor={course.instructor!}
                image={course.image!}
                category={course.category}
                price={course.price}
                videoCount={(course as any).videoCount}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-3 py-12">
              <button
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-[#0a348f] disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => paginate(index + 1)}
                    className={`w-12 h-12 rounded-2xl font-black transition-all ${
                      currentPage === index + 1
                        ? "bg-[#0a348f] text-white shadow-xl scale-110"
                        : "bg-white border border-slate-200 text-slate-500 hover:border-blue-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
                className="p-4 rounded-2xl bg-white border border-slate-200 text-[#0a348f] disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <BookOpen className="text-slate-200 mb-4" size={80} />
          <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">
            No courses available yet
          </h2>
        </div>
      )}
    </div>
  );
}
