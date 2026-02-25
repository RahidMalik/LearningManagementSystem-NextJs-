"use client";
import { useState, useEffect } from "react";
import {
  Loader2,
  AlertCircle,
  Search,
  LayoutGrid,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/services/api";

export interface ICourse {
  _id: string;
  title: string;
  instructor?: string;
  price?: number;
  category?: string;
  image?: string;
  progress?: number;
}

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 16;

  // Is block ko useEffect ke andar update karein
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        const res = await api.getAllCourses();

        if (res.success && res.data && res.data.courses) {
          const formattedData = res.data.courses.map((c: any) => ({
            ...c,
            _id: c._id || c.id,
            image: c.thumbnail || c.image,
            category: c.category || "General",
            price: c.price ?? 0,
          }));
          setCourses(formattedData);
        }
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError("Failed to fetch available courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // Search filter logic
  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // --- Pagination Calculation ---
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(
    indexOfFirstCourse,
    indexOfLastCourse,
  );
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Page change handler
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#0a348f]" size={48} />
        <p className="text-slate-500 font-medium tracking-wide">
          Curating best courses for you...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-red-500" size={48} />
        <p className="text-red-500 font-semibold">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#0a348f] text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-[#0a348f] flex items-center gap-3 tracking-tight">
            <LayoutGrid className="text-blue-600" size={32} />
            Course Catalog
          </h1>
          <p className="text-slate-500 text-lg">
            Showing{" "}
            <span className="text-blue-600 font-bold">
              {filteredCourses.length}
            </span>{" "}
            amazing courses
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-100 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm transition-all"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Courses Grid */}
      {currentCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {currentCourses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-2xl hover:-translate-y-2 group"
              >
                {/* Image Container */}
                <div className="h-48 bg-slate-200 relative overflow-hidden">
                  <img
                    src={
                      course.image ||
                      "https://placehold.co/600x400?text=Course+Image"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md text-[#0a348f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight line-clamp-2 min-h-12">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <span className="text-2xl font-black text-[#0a348f]">
                      {course.price === 0 ? "FREE" : `$${course.price}`}
                    </span>
                    <button className="bg-[#0a348f] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-900/10">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* --- Pagination Controls --- */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 py-10">
              <button
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-[#0a348f] disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all ${
                    currentPage === index + 1
                      ? "bg-[#0a348f] text-white shadow-lg"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
                className="p-3 rounded-xl bg-white border border-slate-200 text-[#0a348f] disabled:opacity-30 hover:bg-slate-50 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <BookOpen className="text-slate-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-slate-600">
            No courses found
          </h2>
        </div>
      )}
    </div>
  );
}
