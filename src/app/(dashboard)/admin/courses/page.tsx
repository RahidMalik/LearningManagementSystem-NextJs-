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
} from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export default function AdminCourses() {
  // --- States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");

  const [categories, setCategories] = useState<string[]>([
    "Web Development",
    "App Development",
    "Graphic Design",
  ]);
  const [newCatInput, setNewCatInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Web Development",
    thumbnail: null as File | string | null,
    videoFile: null as File | null,
  });

  // --- Effects ---
  useEffect(() => {
    fetchCourses();
  }, []);

  // --- Logic Functions ---
  const fetchCourses = async () => {
    try {
      setIsFetching(true);
      const res: any = await api.getAllCourses();

      // API response structure normalization
      if (res && res.courses) {
        setCourses(res.courses);
      } else if (res.data && res.data.courses) {
        setCourses(res.data.courses);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch courses");
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (course: any) => {
    // 🛡️ ID Sanitization: Kisi bhi kism ka extra character (jaise :1) remove karein
    const sanitizedId = course._id.toString().replace(/[:\s].*/, "");

    setEditId(sanitizedId);
    setFormData({
      name: course.title,
      price: course.price.toString(),
      category: course.category,
      thumbnail: course.thumbnail,
      videoFile: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const sanitizedId = id.toString().replace(/[:\s].*/, "");

    try {
      await api.deleteCourse(sanitizedId);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (categories.includes(newCatInput)) {
      toast.error("Category already exists");
      return;
    }
    setCategories([...categories, newCatInput.trim()]);
    setFormData({ ...formData, category: newCatInput.trim() });
    setNewCatInput("");
  };

  const removeCategory = (catToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== catToRemove));
    if (formData.category === catToRemove) {
      setFormData({ ...formData, category: categories[0] });
    }
    toast.success("Category removed");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);
    setUploadStatus("Connecting to Server...");

    try {
      const data = new FormData();
      data.append("title", formData.name);
      data.append("price", formData.price);
      data.append("category", formData.category);

      if (formData.thumbnail instanceof File) {
        data.append("thumbnail", formData.thumbnail);
      }
      if (formData.videoFile instanceof File) {
        data.append("videoFile", formData.videoFile);
      }

      const handleProgress = (percent: number) => {
        setUploadProgress(percent);
        if (percent < 100) {
          setUploadStatus(`Uploading: ${percent}%`);
        } else {
          setUploadStatus("Finalizing on Cloudinary...");
        }
      };

      if (editId) {
        // Double check ke ID clean hai bhejte waqt
        const finalId = editId.replace(/[:\s].*/, "");
        await api.updateCourse(data, finalId, handleProgress);
      } else {
        await api.createCourse(data, handleProgress);
      }

      toast.success(editId ? "Course Updated!" : "Course Published!");
      closeModal();
      fetchCourses();
    } catch (error: any) {
      console.error("Submit Error:", error);
      toast.error(error?.response?.data?.message || "Operation Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsLoading(false);
    setEditId(null);
    setUploadProgress(0);
    setUploadStatus("");
    setFormData({
      name: "",
      price: "",
      category: "Web Development",
      thumbnail: null,
      videoFile: null,
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#0a348f] tracking-tight uppercase italic">
              Course Manager
            </h1>
            <p className="text-slate-500 font-medium italic">
              Create and manage your educational content
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0a348f] text-white px-8 py-4 rounded-[2rem] font-bold flex items-center gap-2 shadow-xl shadow-blue-900/20 border-2 border-white/10"
          >
            <Plus size={24} /> Create Course
          </motion.button>
        </div>

        {/* Course List Section */}
        {isFetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#0a348f]" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.length > 0 ? (
              courses.map((course) => (
                <motion.div
                  layout
                  key={course._id}
                  className="bg-white p-4 rounded-[2.2rem] border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={course.thumbnail}
                      className="h-20 w-32 rounded-[1.2rem] object-cover bg-slate-100"
                      alt="thumbnail"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">
                        {course.title}
                      </h3>
                      <span className="text-[10px] bg-blue-50 text-[#0a348f] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                        {course.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-2xl font-black text-[#0a348f] mr-4">
                      ${course.price}
                    </span>

                    <button
                      onClick={() => handleEdit(course)}
                      className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-[#0a348f] hover:text-white transition-all shadow-sm"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest">
                  No courses available
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- MODAL SECTION --- */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/40">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
              >
                {/* Upload Overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-12 text-center"
                    >
                      <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="mb-6"
                      >
                        <Upload className="text-[#0a348f]" size={64} />
                      </motion.div>
                      <h2 className="text-2xl font-black text-[#0a348f] italic uppercase mb-4">
                        {uploadStatus}
                      </h2>
                      <div className="w-full max-w-sm bg-slate-100 h-3 rounded-full overflow-hidden border shadow-inner">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-600 to-[#0a348f]"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <span className="mt-4 text-4xl font-black text-[#0a348f] tracking-tighter">
                        {uploadProgress}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-xl font-black text-[#0a348f] italic uppercase underline decoration-blue-200 underline-offset-8">
                    {editId ? "Update Course" : "Course Setup"}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white rounded-full transition-all"
                  >
                    <X />
                  </button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="p-8 space-y-6 overflow-y-auto max-h-[70vh]"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="Course Title"
                      className="p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100 font-bold"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <input
                      required
                      placeholder="Price ($)"
                      type="number"
                      className="p-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-blue-100 font-bold"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        placeholder="New Category..."
                        className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none border"
                        value={newCatInput}
                        onChange={(e) => setNewCatInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-[#0a348f] text-white px-6 rounded-2xl font-bold"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <div key={cat} className="group relative">
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, category: cat })
                            }
                            className={`pl-4 pr-8 py-2 rounded-xl text-xs font-bold transition-all ${
                              formData.category === cat
                                ? "bg-[#0a348f] text-white shadow-lg shadow-blue-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {cat}{" "}
                            {formData.category === cat && (
                              <Check size={14} className="inline ml-1" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="relative h-40 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-blue-300 overflow-hidden transition-all">
                      {formData.thumbnail ? (
                        <img
                          src={
                            typeof formData.thumbnail === "string"
                              ? formData.thumbnail
                              : URL.createObjectURL(formData.thumbnail)
                          }
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-300">
                          <ImageIcon size={30} />
                          <span className="text-[10px] font-black mt-2">
                            THUMBNAIL
                          </span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            thumbnail: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </div>

                    <div className="relative h-40 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-blue-300 transition-all text-slate-300 text-center px-4">
                      <Video
                        className={formData.videoFile ? "text-green-500" : ""}
                        size={30}
                      />
                      <span className="text-[10px] font-black mt-2 uppercase truncate w-full px-2">
                        {formData.videoFile
                          ? formData.videoFile.name
                          : editId
                            ? "Keep Current Video"
                            : "Select Video (MP4)"}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            videoFile: e.target.files?.[0] || null,
                          })
                        }
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-[#0a348f] text-white rounded-[2rem] font-black uppercase shadow-2xl shadow-blue-900/30 flex justify-center items-center gap-3 active:scale-95 transition-all disabled:bg-slate-300"
                  >
                    <Plus size={20} strokeWidth={3} />{" "}
                    {editId ? "Update Course Now" : "Publish Course Now"}
                  </motion.button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
