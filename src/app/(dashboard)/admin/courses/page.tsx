"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "@/components/admin/AdminSidebar";
import {
  Plus,
  Trash2,
  X,
  Video,
  Image as ImageIcon,
  Loader2,
  Check,
  Upload,
  Pencil,
  BookOpen,
  Search,
  Tag,
  User,
  Globe,
  Clock,
  BarChart2,
  Star,
  Award,
  AlignLeft,
} from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const BADGES = ["Best Seller", "New Release", "Top Rated", "Featured"];
const LANGUAGES = ["Urdu", "English", "Urdu + English"];

const EMPTY_FORM = {
  title: "",
  price: "",
  category: "Web Development",
  description: "",
  instructor: "",
  instructorImage: "",
  level: "Beginner",
  language: "Urdu",
  hours: "",
  rating: "",
  badge: "New Release",
  thumbnail: null as File | string | null,
  introVideo: null as File | null, // optional intro video file
  instructorImageFile: null as File | null, // optional instructor image file
  lectures: [] as { title: string; videoFile: File | null; videoUrl: string }[],
};

type FormData = typeof EMPTY_FORM;

// ── Upload status per-item ──────────────────────────
type UploadItem = { label: string; progress: number; done: boolean };

export default function AdminCourses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<FormData>({ ...EMPTY_FORM });

  const [categories, setCategories] = useState([
    "Web Development",
    "App Development",
    "Graphic Design",
    "Digital Marketing",
    "Photography",
    "Business",
  ]);
  const [newCatInput, setNewCatInput] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const set = (key: string, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const fetchCourses = async () => {
    try {
      setIsFetching(true);
      const res: any = await api.getAllCourses();
      if (res?.courses) setCourses(res.courses);
      else if (res?.data?.courses) setCourses(res.data.courses);
    } catch {
      toast.error("Failed to fetch courses");
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (course: any) => {
    const rawId = course._id?.toString() || "";
    const sanitizedId =
      rawId.match(/[0-9a-fA-F]{24}/)?.[0] || rawId.replace(/[:\s].*/, "");
    if (!sanitizedId) {
      toast.error("Could not parse Course ID");
      return;
    }
    setEditId(sanitizedId);
    setFormData({
      title: course.title || "",
      price: String(course.price || ""),
      category: course.category || "Web Development",
      description: course.description || "",
      instructor: course.instructor || "",
      instructorImage: course.instructorImage || "",
      level: course.level || "Beginner",
      language: course.language || "Urdu",
      hours: course.hours || "",
      rating: course.rating || "",
      badge: course.badge || "New Release",
      thumbnail: course.thumbnail || null,
      introVideo: null,
      instructorImageFile: null,
      lectures: (course.lectures || []).map((l: any) => ({
        title: l.title || "",
        videoFile: null,
        videoUrl: l.videoUrl || l.url || "",
      })),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.deleteCourse(id.toString().replace(/[:\s].*/, ""));
      toast.success("Course deleted");
      fetchCourses();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (categories.includes(newCatInput.trim())) {
      toast.error("Already exists");
      return;
    }
    setCategories((prev) => [...prev, newCatInput.trim()]);
    set("category", newCatInput.trim());
    setNewCatInput("");
  };

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    if (formData.category === cat) set("category", categories[0]);
  };

  // ── Update lecture field ──
  const updateLecture = (
    idx: number,
    field: "title" | "videoFile" | "videoUrl",
    value: any,
  ) => {
    const updated = [...formData.lectures];
    (updated[idx] as any)[field] = value;
    set("lectures", updated);
  };

  // ── Main submit ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOverallProgress(0);

    // Build upload queue for progress display
    const items: UploadItem[] = [];
    if (formData.thumbnail instanceof File)
      items.push({ label: "Thumbnail", progress: 0, done: false });
    if (formData.introVideo)
      items.push({ label: "Intro Video", progress: 0, done: false });
    if (formData.instructorImageFile)
      items.push({ label: "Instructor Image", progress: 0, done: false });
    formData.lectures.forEach((l, i) => {
      if (l.videoFile)
        items.push({
          label: `Lecture ${i + 1}: ${l.title || "Video"}`,
          progress: 0,
          done: false,
        });
    });
    setUploadItems(items);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("price", formData.price);
      data.append("category", formData.category);
      data.append("description", formData.description);
      data.append("instructor", formData.instructor);
      data.append("level", formData.level);
      data.append("language", formData.language);
      data.append("hours", formData.hours);
      data.append("rating", formData.rating);
      data.append("badge", formData.badge);

      // Optional files
      if (formData.thumbnail instanceof File)
        data.append("thumbnail", formData.thumbnail);
      if (formData.introVideo instanceof File)
        data.append("videoFile", formData.introVideo);
      if (formData.instructorImageFile instanceof File)
        data.append("instructorImage", formData.instructorImageFile);

      // Lectures — send titles + existing URLs; video files sent separately
      const lecturesMeta = formData.lectures.map((l, i) => ({
        title: l.title,
        videoUrl: l.videoUrl || "",
        hasNewVideo: !!l.videoFile,
        fileIndex: i,
      }));
      data.append("lectures", JSON.stringify(lecturesMeta));

      // Append each lecture video file with index key
      formData.lectures.forEach((l, i) => {
        if (l.videoFile instanceof File) {
          data.append(`lectureVideo_${i}`, l.videoFile);
        }
      });

      const onProgress = (p: number) => {
        setOverallProgress(p);
        // Update all upload items proportionally
        setUploadItems((prev) =>
          prev.map((item) => (item.done ? item : { ...item, progress: p })),
        );
      };

      if (editId) {
        await api.updateCourse(data, editId.trim(), onProgress);
        toast.success("Course updated!");
      } else {
        await api.createCourse(data, onProgress);
        toast.success("Course published!");
      }
      closeModal();
      fetchCourses();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setEditId(null);
    setOverallProgress(0);
    setUploadItems([]);
    setFormData({ ...EMPTY_FORM });
  };

  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inp =
    "w-full p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0a348f] dark:focus:border-blue-500 transition-all";
  const lbl =
    "block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5";
  const sectionHead =
    "text-[10px] font-black text-[#0a348f] dark:text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5";

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      <AdminSidebar />

      <main className="flex-1 overflow-auto">
        {/* ── Header ── */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen
                  size={18}
                  className="text-[#0a348f] dark:text-blue-400"
                />
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Course Manager
                </h1>
              </div>
              <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium mt-0.5">
                {courses.length} courses total
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative hidden sm:flex items-center">
                <Search
                  size={14}
                  className="absolute left-3.5 text-slate-400 dark:text-zinc-500"
                />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl w-48 sm:w-56 text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:border-[#0a348f] transition-all"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-[#0a348f] dark:bg-blue-500 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:bg-blue-800 transition-all"
              >
                <Plus size={16} strokeWidth={3} />
                <span className="hidden sm:inline">Create Course</span>
                <span className="sm:hidden">Create</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── Course List ── */}
        <div className="px-4 sm:px-8 py-6 sm:py-8">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-tight">
                All Courses
              </h2>
              {searchQuery && (
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  {filtered.length} results
                </span>
              )}
            </div>

            {isFetching ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2
                  className="animate-spin text-[#0a348f] dark:text-blue-400"
                  size={32}
                />
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Loading...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center">
                  <BookOpen
                    size={28}
                    className="text-slate-300 dark:text-zinc-600"
                  />
                </div>
                <p className="font-black text-slate-400 text-sm uppercase tracking-widest">
                  No courses found
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-[#0a348f] text-white px-5 py-2.5 rounded-2xl font-bold text-xs"
                >
                  <Plus size={14} /> Create Course
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50 dark:divide-zinc-800">
                <AnimatePresence>
                  {filtered.map((course, idx) => (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-all group"
                    >
                      <div className="relative w-20 sm:w-28 h-14 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-zinc-800">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={18} className="text-slate-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-sm text-slate-800 dark:text-white truncate group-hover:text-[#0a348f] dark:group-hover:text-blue-400 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-500/10 text-[#0a348f] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase">
                            <Tag size={8} /> {course.category}
                          </span>
                          {course.level && (
                            <span className="hidden sm:inline text-[9px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded-lg font-black uppercase">
                              {course.level}
                            </span>
                          )}
                          {course.badge && (
                            <span className="hidden sm:inline text-[9px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 px-2 py-0.5 rounded-lg font-black">
                              {course.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="font-black text-sm sm:text-base text-[#0a348f] dark:text-blue-400">
                          PKR {course.price}
                        </p>
                        {course.hours && (
                          <p className="text-[10px] text-slate-400">
                            {course.hours} hrs
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                          onClick={() => handleEdit(course)}
                          className="p-2 sm:p-2.5 bg-blue-50 dark:bg-blue-500/10 text-[#0a348f] dark:text-blue-400 rounded-xl hover:bg-[#0a348f] hover:text-white transition-all border border-blue-100 dark:border-blue-500/20"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="p-2 sm:p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-500/20"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ══════════════════ MODAL ══════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden relative border border-slate-100 dark:border-zinc-800 max-h-[95vh] sm:max-h-[90vh] flex flex-col"
            >
              {/* Upload overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-white/98 dark:bg-zinc-900/98 flex flex-col items-center justify-center p-8 sm:p-12 text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="mb-5"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Upload
                          className="text-[#0a348f] dark:text-blue-400"
                          size={30}
                        />
                      </div>
                    </motion.div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-1">
                      Uploading to Cloudinary...
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-zinc-500 mb-5">
                      Please don't close this window
                    </p>

                    {/* Per-item progress */}
                    <div className="w-full max-w-xs space-y-2 mb-4">
                      {uploadItems.map((item, i) => (
                        <div key={i} className="text-left">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-zinc-400 mb-1">
                            <span>{item.label}</span>
                            <span>{item.done ? "✓" : `${item.progress}%`}</span>
                          </div>
                          <div className="h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${item.done ? "bg-green-400" : "bg-gradient-to-r from-[#0a348f] to-blue-400"}`}
                              initial={{ width: 0 }}
                              animate={{
                                width: item.done ? "100%" : `${item.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full max-w-xs bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#0a348f] to-blue-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${overallProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="mt-3 text-3xl sm:text-4xl font-black text-[#0a348f] dark:text-blue-400">
                      {overallProgress}%
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Modal header */}
              <div className="px-5 sm:px-7 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center bg-slate-50/50 dark:bg-zinc-800/30 flex-shrink-0">
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    {editId ? "Update Course" : "Create New Course"}
                  </h2>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                    Fill in the details below
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-xl transition-all"
                >
                  <X size={18} className="text-slate-500 dark:text-zinc-400" />
                </button>
              </div>

              {/* ── Form ── */}
              <form
                onSubmit={handleSubmit}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
                  {/* ── Basic Info ── */}
                  <div>
                    <p className={sectionHead}>
                      <BookOpen size={11} /> Basic Info
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="sm:col-span-2">
                        <label className={lbl}>Course Title *</label>
                        <input
                          required
                          placeholder="e.g. Full Stack Development with Next.js"
                          className={inp}
                          value={formData.title}
                          onChange={(e) => set("title", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={lbl}>Price (PKR) *</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 dark:text-zinc-500">
                            PKR
                          </span>
                          <input
                            required
                            type="number"
                            placeholder="1000"
                            min="0"
                            className={inp + " pl-11"}
                            value={formData.price}
                            onChange={(e) => set("price", e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className={lbl}>Duration (Hours)</label>
                        <div className="relative">
                          <Clock
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                          />
                          <input
                            type="number"
                            placeholder="e.g. 12"
                            min="0"
                            className={inp + " pl-8"}
                            value={formData.hours}
                            onChange={(e) => set("hours", e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={lbl}>Description</label>
                        <div className="relative">
                          <AlignLeft
                            size={14}
                            className="absolute left-3 top-3.5 text-slate-400 dark:text-zinc-500"
                          />
                          <textarea
                            rows={3}
                            placeholder="What will students learn in this course?"
                            className={inp + " pl-8 resize-none"}
                            value={formData.description}
                            onChange={(e) => set("description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Instructor ── */}
                  <div>
                    <p className={sectionHead}>
                      <User size={11} /> Instructor
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={lbl}>Instructor Name</label>
                        <div className="relative">
                          <User
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
                          />
                          <input
                            placeholder="e.g. Ahmed Khan"
                            className={inp + " pl-8"}
                            value={formData.instructor}
                            onChange={(e) => set("instructor", e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Instructor image — file upload (optional) */}
                      <div>
                        <label className={lbl}>
                          Instructor Image
                          <span className="ml-1 text-zinc-400 normal-case font-medium">
                            (optional)
                          </span>
                        </label>
                        <div className="relative h-11 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-zinc-800 hover:border-[#0a348f] dark:hover:border-blue-500 transition-all group/iimg flex items-center gap-3 px-3 cursor-pointer">
                          {formData.instructorImageFile ? (
                            <>
                              <img
                                src={URL.createObjectURL(
                                  formData.instructorImageFile,
                                )}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                alt=""
                              />
                              <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 truncate flex-1">
                                {formData.instructorImageFile.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  set("instructorImageFile", null);
                                }}
                                className="p-1 hover:bg-red-50 rounded-lg flex-shrink-0"
                              >
                                <X size={12} className="text-red-400" />
                              </button>
                            </>
                          ) : formData.instructorImage ? (
                            <>
                              <img
                                src={formData.instructorImage}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                                alt=""
                              />
                              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate flex-1">
                                Current image
                              </span>
                              <span className="text-[9px] text-slate-400 dark:text-zinc-500 font-bold uppercase">
                                Change
                              </span>
                            </>
                          ) : (
                            <>
                              <div
                                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0
                                group-hover/iimg:bg-blue-50 dark:group-hover/iimg:bg-blue-500/10 transition-colors"
                              >
                                <User
                                  size={13}
                                  className="text-slate-300 dark:text-zinc-500 group-hover/iimg:text-[#0a348f] dark:group-hover/iimg:text-blue-400 transition-colors"
                                />
                              </div>
                              <span className="text-xs text-slate-300 dark:text-zinc-600 font-bold group-hover/iimg:text-[#0a348f] dark:group-hover/iimg:text-blue-400 transition-colors">
                                Upload photo
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                              set(
                                "instructorImageFile",
                                e.target.files?.[0] || null,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Course Details ── */}
                  <div>
                    <p className={sectionHead}>
                      <BarChart2 size={11} /> Course Details
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      {/* Level */}
                      <div>
                        <label className={lbl}>Level</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {LEVELS.map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => set("level", l)}
                              className={`py-2 px-1 sm:px-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wide border transition-all ${
                                formData.level === l
                                  ? "bg-[#0a348f] dark:bg-blue-500 text-white border-transparent shadow-md"
                                  : "bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 hover:border-[#0a348f]"
                              }`}
                            >
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Language */}
                      <div>
                        <label className={lbl}>Language</label>
                        <div className="flex flex-col gap-1.5">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => set("language", lang)}
                              className={`py-2 px-2 sm:px-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wide border transition-all flex items-center gap-1 ${
                                formData.language === lang
                                  ? "bg-[#0a348f] dark:bg-blue-500 text-white border-transparent"
                                  : "bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 hover:border-[#0a348f]"
                              }`}
                            >
                              <Globe size={9} /> {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Badge + Rating */}
                      <div className="space-y-3">
                        <div>
                          <label className={lbl}>Badge</label>
                          <div className="flex flex-col gap-1.5">
                            {BADGES.map((b) => (
                              <button
                                key={b}
                                type="button"
                                onClick={() => set("badge", b)}
                                className={`py-2 px-2 rounded-xl text-[9px] sm:text-[10px] font-black border transition-all flex items-center gap-1 ${
                                  formData.badge === b
                                    ? "bg-amber-500 text-white border-transparent"
                                    : "bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-zinc-700 hover:border-amber-400"
                                }`}
                              >
                                <Award size={9} /> {b}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={lbl}>Rating</label>
                          <div className="relative">
                            <Star
                              size={13}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400"
                            />
                            <input
                              type="number"
                              placeholder="4.5"
                              min="0"
                              max="5"
                              step="0.1"
                              className={inp + " pl-8"}
                              value={formData.rating}
                              onChange={(e) => set("rating", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Category ── */}
                  <div>
                    <p className={sectionHead}>
                      <Tag size={11} /> Category
                    </p>
                    <div className="flex gap-2 mb-3">
                      <input
                        placeholder="Add new category..."
                        className={inp + " flex-1"}
                        value={newCatInput}
                        onChange={(e) => setNewCatInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddCategory())
                        }
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-[#0a348f] dark:bg-blue-500 text-white px-4 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <div key={cat} className="relative group/cat">
                          <button
                            type="button"
                            onClick={() => set("category", cat)}
                            className={`pl-3 sm:pl-3.5 pr-6 sm:pr-7 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              formData.category === cat
                                ? "bg-[#0a348f] dark:bg-blue-500 text-white border-transparent shadow-md"
                                : "bg-slate-50 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:border-[#0a348f]"
                            }`}
                          >
                            {cat}{" "}
                            {formData.category === cat && (
                              <Check size={11} className="inline ml-1" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/cat:opacity-100 transition-opacity"
                          >
                            <X size={8} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Media ── */}
                  <div>
                    <p className={sectionHead}>
                      <Video size={11} /> Media
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Thumbnail */}
                      <div>
                        <label className={lbl}>Thumbnail Image</label>
                        <div className="relative h-32 sm:h-36 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-zinc-800 hover:border-[#0a348f] dark:hover:border-blue-500 transition-all group/thumb">
                          {formData.thumbnail ? (
                            <>
                              <img
                                src={
                                  typeof formData.thumbnail === "string"
                                    ? formData.thumbnail
                                    : URL.createObjectURL(
                                        formData.thumbnail as File,
                                      )
                                }
                                className="w-full h-full object-cover"
                                alt="preview"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-black bg-black/50 px-3 py-1 rounded-full">
                                  Change
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                              <div className="p-3 bg-slate-100 dark:bg-zinc-700 rounded-2xl group-hover/thumb:bg-blue-50 dark:group-hover/thumb:bg-blue-500/10 transition-colors">
                                <ImageIcon
                                  size={20}
                                  className="text-slate-300 dark:text-zinc-500 group-hover/thumb:text-[#0a348f] dark:group-hover/thumb:text-blue-400 transition-colors"
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-wider">
                                Upload Thumbnail
                              </span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                              set("thumbnail", e.target.files?.[0] || null)
                            }
                          />
                        </div>
                      </div>

                      {/* Intro video — OPTIONAL */}
                      <div>
                        <label className={lbl}>
                          Intro Video
                          <span className="ml-1 text-zinc-400 normal-case font-medium">
                            (optional)
                          </span>
                        </label>
                        <div className="relative h-32 sm:h-36 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl bg-slate-50 dark:bg-zinc-800 hover:border-[#0a348f] dark:hover:border-blue-500 transition-all group/vid flex flex-col items-center justify-center gap-2 px-4">
                          <div
                            className={`p-3 rounded-2xl transition-colors ${formData.introVideo ? "bg-green-50 dark:bg-green-500/10" : "bg-slate-100 dark:bg-zinc-700 group-hover/vid:bg-blue-50 dark:group-hover/vid:bg-blue-500/10"}`}
                          >
                            <Video
                              size={20}
                              className={
                                formData.introVideo
                                  ? "text-green-500"
                                  : "text-slate-300 dark:text-zinc-500 group-hover/vid:text-[#0a348f] dark:group-hover/vid:text-blue-400 transition-colors"
                              }
                            />
                          </div>
                          <span className="text-[10px] font-black text-center uppercase tracking-wider truncate w-full text-center px-2 text-slate-300 dark:text-zinc-600">
                            {formData.introVideo
                              ? formData.introVideo.name
                              : editId
                                ? "Keep current / skip"
                                : "Upload MP4 (optional)"}
                          </span>
                          {formData.introVideo && (
                            <>
                              <span className="text-[9px] bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-black border border-green-100 dark:border-green-500/20">
                                Selected ✓
                              </span>
                              <button
                                type="button"
                                onClick={() => set("introVideo", null)}
                                className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                              >
                                <X size={10} />
                              </button>
                            </>
                          )}
                          <input
                            type="file"
                            accept="video/mp4,video/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) =>
                              set("introVideo", e.target.files?.[0] || null)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Lectures ── */}
                  <div>
                    <p className={sectionHead}>
                      <Video size={11} /> Lectures
                    </p>

                    <div className="space-y-2 mb-3">
                      {formData.lectures.map((lec, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl p-3 sm:p-4 group/lec space-y-2"
                        >
                          {/* Top row: number + title + remove */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#0a348f]/10 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-black text-[#0a348f] dark:text-blue-400">
                                {idx + 1}
                              </span>
                            </div>
                            <input
                              placeholder="Lecture title"
                              value={lec.title}
                              onChange={(e) =>
                                updateLecture(idx, "title", e.target.value)
                              }
                              className="flex-1 bg-transparent text-sm font-semibold text-slate-700 dark:text-zinc-300 placeholder:text-slate-300 dark:placeholder:text-zinc-600 focus:outline-none min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                set(
                                  "lectures",
                                  formData.lectures.filter((_, i) => i !== idx),
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-300 dark:text-zinc-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all flex-shrink-0"
                            >
                              <X size={13} />
                            </button>
                          </div>

                          {/* Video upload row */}
                          <div className="relative border border-dashed border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden hover:border-[#0a348f] dark:hover:border-blue-500 transition-all group/lvid">
                            <div className="flex items-center gap-2.5 px-3 py-2.5">
                              <div
                                className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${lec.videoFile ? "bg-green-50 dark:bg-green-500/10" : "bg-slate-100 dark:bg-zinc-700 group-hover/lvid:bg-blue-50 dark:group-hover/lvid:bg-blue-500/10"}`}
                              >
                                <Video
                                  size={13}
                                  className={
                                    lec.videoFile
                                      ? "text-green-500"
                                      : "text-slate-400 dark:text-zinc-500 group-hover/lvid:text-[#0a348f] dark:group-hover/lvid:text-blue-400 transition-colors"
                                  }
                                />
                              </div>
                              <span className="text-xs text-slate-400 dark:text-zinc-500 truncate flex-1">
                                {lec.videoFile
                                  ? lec.videoFile.name
                                  : lec.videoUrl
                                    ? "✓ Has video — click to replace"
                                    : "Upload lecture video (MP4)"}
                              </span>
                              {(lec.videoFile || lec.videoUrl) && (
                                <span className="text-[9px] bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-black border border-green-100 dark:border-green-500/20 flex-shrink-0">
                                  {lec.videoFile ? "New ✓" : "Saved ✓"}
                                </span>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="video/mp4,video/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) =>
                                updateLecture(
                                  idx,
                                  "videoFile",
                                  e.target.files?.[0] || null,
                                )
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        set("lectures", [
                          ...formData.lectures,
                          { title: "", videoFile: null, videoUrl: "" },
                        ])
                      }
                      className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider hover:border-[#0a348f] dark:hover:border-blue-500 hover:text-[#0a348f] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={13} strokeWidth={3} /> Add Lecture
                    </button>
                  </div>
                </div>

                {/* ── Submit ── */}
                <div className="px-5 sm:px-7 py-4 sm:py-5 pb-24 sm:pb-5 border-t border-slate-100 dark:border-zinc-800 flex-shrink-0">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 sm:py-4 bg-[#0a348f] dark:bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-200 dark:shadow-blue-900/30 flex justify-center items-center gap-2 hover:bg-blue-800 dark:hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Plus size={18} strokeWidth={3} />
                    )}
                    {editId ? "Update Course" : "Publish Course"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
