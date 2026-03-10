"use client";

import { useState, useEffect } from "react";
import {
  Star,
  MessageSquare,
  Loader2,
  Search,
  Trash2,
  BookOpen, // Naya icon add kiya course ke liye
} from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

interface IReview {
  _id: string;
  user: { _id: string; name: string; photoURL?: string };
  course: { _id: string; title: string; thumbnail?: string };
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviews() {
  const [allReviews, setAllReviews] = useState<IReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Fetch ALL reviews on mount ──
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        const res = await api.getAllReviews(1, 1000);
        const data: any = res?.data ?? res;
        const list: IReview[] = data?.reviews ?? [];

        setAllReviews(list);
        setFilteredReviews(list);
      } catch {
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchAllReviews();
  }, []);

  // ── Debouncing & Filtering Logic ──
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = searchTerm.toLowerCase().trim();

      if (!query) {
        setFilteredReviews(allReviews);
        return;
      }

      // Filter by User Name, Course Title, or Comment
      const filtered = allReviews.filter(
        (r) =>
          (r.user?.name || "").toLowerCase().includes(query) ||
          (r.course?.title || "").toLowerCase().includes(query) ||
          (r.comment || "").toLowerCase().includes(query),
      );

      setFilteredReviews(filtered);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, allReviews]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Delete this review?")) return;
    setDeleting(reviewId);
    try {
      const res: any = await api.deleteReview(reviewId);
      if (res?.success || res?.data?.success) {
        toast.success("Review deleted");

        setAllReviews((prev) => prev.filter((r) => r._id !== reviewId));
        setFilteredReviews((prev) => prev.filter((r) => r._id !== reviewId));
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const avgRating = filteredReviews.length
    ? (
        filteredReviews.reduce((s, r) => s + r.rating, 0) /
        filteredReviews.length
      ).toFixed(1)
    : "0";

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-auto p-4 sm:p-8">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={18}
                className="text-[#0a348f] dark:text-blue-400"
              />
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Student Reviews
              </h2>
              {!loading && (
                <span className="text-xs bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 font-black px-2.5 py-0.5 rounded-full">
                  {filteredReviews.length}
                </span>
              )}
            </div>

            {/* Search (Controlled with Debounce) */}
            <div className="relative flex items-center gap-2">
              <Search
                size={13}
                className="absolute left-3 text-slate-400 dark:text-zinc-500"
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, course, or comment..."
                className="pl-8 pr-4 py-2 text-xs border border-slate-200 dark:border-zinc-700 rounded-xl w-60 text-slate-700 dark:text-zinc-300 placeholder:text-slate-400 focus:outline-none focus:border-[#0a348f] dark:focus:border-blue-500 transition-all bg-transparent"
              />
            </div>
          </div>

          {/* Stats bar */}
          {!loading && filteredReviews.length > 0 && (
            <div className="flex items-center gap-4 bg-blue-50/60 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-amber-400 fill-amber-400" />
                <span className="font-black text-slate-800 dark:text-white text-sm">
                  {avgRating}
                </span>
                <span className="text-xs text-slate-400 dark:text-zinc-500">
                  avg rating
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700" />
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                {filteredReviews.length} reviews found
              </span>
            </div>
          )}

          {/* Reviews list */}
          <div className="border border-slate-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[#0a348f] dark:text-blue-400"
                />
                <p className="text-xs font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                  Loading reviews...
                </p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <MessageSquare
                  size={30}
                  className="text-slate-200 dark:text-zinc-700"
                />
                <p className="text-sm font-black text-slate-300 dark:text-zinc-600 uppercase tracking-widest">
                  No reviews found
                </p>
              </div>
            ) : (
              <div className="max-h-125 overflow-y-auto custom-scrollbar">
                <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {filteredReviews.map((review) => (
                    <div
                      key={review._id}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-all group"
                    >
                      {/* User avatar */}
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shrink-0 mt-1 shadow-sm">
                        {review.user?.photoURL ? (
                          <img
                            src={review.user.photoURL}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-black text-xs">
                            {review.user?.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex flex-col gap-1.5">
                            {/* User Name */}
                            <span className="font-black text-sm text-slate-800 dark:text-white">
                              {review.user?.name}
                            </span>

                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 w-fit px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                              {review.course?.thumbnail ? (
                                <img
                                  src={review.course.thumbnail}
                                  alt="course"
                                  className="w-4 h-4 rounded-lg object-cover shrink-0"
                                />
                              ) : (
                                <BookOpen
                                  size={12}
                                  className="text-slate-400 shrink-0"
                                />
                              )}
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400">
                                Course:{" "}
                                <span className="font-bold text-[#0a348f] dark:text-blue-400 ml-0.5">
                                  {review.course?.title}
                                </span>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-2">
                              {/* Stars */}
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={12}
                                    className={
                                      s <= review.rating
                                        ? "text-amber-400 fill-amber-400"
                                        : "text-slate-200 dark:text-slate-600"
                                    }
                                  />
                                ))}
                              </div>
                              {/* Date */}
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-PK",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(review._id)}
                              disabled={deleting === review._id}
                              className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:text-white hover:bg-red-500 transition-all flex items-center gap-1.5 text-[10px] font-bold"
                            >
                              {deleting === review._id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <>
                                  <Trash2 size={12} /> Delete
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-zinc-300 mt-3 leading-relaxed bg-white dark:bg-zinc-800/50 p-3 rounded-xl border border-slate-100 dark:border-zinc-700/50">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
