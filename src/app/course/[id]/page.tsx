"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Loader2,
  PlayCircle,
  Award,
  Star,
  Clock,
  CheckCircle2,
  ChevronLeft,
  Send,
  Lock,
  Play,
  ListVideo,
} from "lucide-react";
import Image from "next/image";
import { api } from "@/services/api";
import { CybexPlayer } from "@/components/shared/CybexPlayer";

export interface CourseDetailData {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  instructor?: string;
  price?: number;
  category?: string;
  image?: string;
  thumbnail?: string;
  videoUrl?: string;
  progress?: number;
  lectures?: any[];
  badge?: string;
  level?: string;
  rating?: string;
  hours?: string;
  language?: string;
}

export default function CourseDetailPage() {
  const [course, setCourse] = useState<CourseDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const [courseRes, enrollRes] = await Promise.all([
          api.getCourseDetails(id),
          api.checkEnrollment(id),
        ]);
        if (courseRes.success) setCourse(courseRes.data ?? null);
        setIsEnrolled(enrollRes.isEnrolled === true);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourseData();
  }, [id]);

  const lecturesList = course?.lectures?.length
    ? course.lectures
    : course?.videoUrl
      ? [{ _id: "main", title: "Main Course Video", videoUrl: course.videoUrl }]
      : [];

  const handleEnrollClick = () => {
    if (isEnrolled) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to enroll!");
      router.push(`/login?redirect=/course/${id}`);
      return;
    }
    setIsChecking(true);
    router.push(`/payment/${id}`);
  };

  const handlePlayVideo = (videoUrl: string, idx: number) => {
    if (!isEnrolled) {
      toast.error("Please enroll first!");
      return;
    }
    setActiveVideo(videoUrl);
    setActiveIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center transition-colors duration-300">
        <Loader2
          className="animate-spin text-[#0a348f] dark:text-blue-400 mb-4"
          size={40}
        />
        <p className="font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-xs">
          Loading...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center font-bold text-red-500 transition-colors duration-300">
        Course not found!
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Nav */}
      <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center gap-3 sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 transition-colors duration-300">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronLeft size={22} className="text-slate-700 dark:text-white" />
        </button>
        <h1 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1 flex-1">
          {course.title}
        </h1>
        {!isEnrolled && (
          <button
            onClick={handleEnrollClick}
            disabled={isChecking}
            className="bg-[#0a348f] dark:bg-white text-white dark:text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-blue-800 dark:hover:bg-zinc-200 transition-all"
          >
            {isChecking ? (
              <Loader2 className="animate-spin" size={14} />
            ) : (
              "Enroll Now"
            )}
          </button>
        )}
      </div>

      {/* YOUTUBE LAYOUT */}
      <div className="flex flex-col lg:flex-row max-w-350 mx-auto">
        {/* LEFT — Video + Details */}
        <div className="flex-1 lg:max-w-[calc(100%-380px)]">
          <div className="w-full aspect-video bg-black relative lg:rounded-br-2xl shadow-md overflow-hidden">
            {activeVideo ? (
              <CybexPlayer videoUrl={activeVideo} />
            ) : (
              <div className="relative w-full h-full bg-slate-900">
                <Image
                  src={
                    course.thumbnail ||
                    course.image ||
                    "https://placehold.co/1280x720?text=Course"
                  }
                  alt={course.title}
                  fill
                  sizes="100vw"
                  className="object-cover opacity-90"
                />
                <div
                  onClick={() => {
                    if (!isEnrolled) {
                      toast.error("Please enroll first!");
                      return;
                    }
                    if (lecturesList.length > 0)
                      handlePlayVideo(
                        lecturesList[0].videoUrl || lecturesList[0].url,
                        0,
                      );
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer group z-10"
                >
                  <div className="w-20 h-20 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl">
                    <Play
                      size={32}
                      className="text-[#0a348f] ml-1"
                      fill="currentColor"
                    />
                  </div>
                </div>
                {!isEnrolled && (
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 z-20">
                    <Lock size={12} className="text-yellow-400" />
                    <span className="text-xs font-bold text-white">
                      Enroll to watch
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="px-4 py-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
              {activeVideo
                ? lecturesList[activeIndex]?.title || course.title
                : course.title}
            </h2>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {course.instructor || "Admin"}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {lecturesList.length} videos
              </span>
              {isEnrolled && (
                <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-200 dark:border-green-500/30">
                  ✓ Enrolled
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pb-8 pt-4 transition-colors duration-300">
            <Tabs defaultValue="overview">
              <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 rounded-none w-full justify-start h-12 gap-8 mb-6 overflow-x-auto overflow-y-hidden">
                {["overview", "reviews"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-slate-500 dark:text-slate-400 data-[state=active]:text-[#0a348f] dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-[#0a348f] dark:data-[state=active]:border-blue-400 rounded-none bg-transparent capitalize font-bold text-sm px-1 pb-2 shadow-none"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-[#0a348f] dark:bg-blue-600 text-white hover:bg-blue-800 border-0">
                      New Release
                    </Badge>
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 hover:bg-amber-200">
                      Best Seller
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 pt-2">
                    About this course
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {course.description ||
                      "Master the skills needed for this course with our comprehensive curriculum."}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                    {[
                      {
                        icon: PlayCircle,
                        label: `${lecturesList.length} Videos`,
                      },
                      { icon: Award, label: "Certificate" },
                      { icon: Clock, label: "Lifetime Access" },
                      { icon: CheckCircle2, label: "All Levels" },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-center gap-2 text-center p-3 rounded-2xl bg-slate-50 dark:bg-slate-900"
                      >
                        <item.icon
                          size={20}
                          className="text-[#0a348f] dark:text-blue-400"
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isEnrolled && (
                  <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm transition-colors duration-300">
                    <div>
                      <p className="text-3xl font-black text-[#0a348f] dark:text-blue-400">
                        PKR {course.price}
                      </p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-green-500" />{" "}
                        One-time payment • Lifetime access
                      </p>
                    </div>
                    <button
                      onClick={handleEnrollClick}
                      disabled={isChecking}
                      className="bg-[#0a348f]  w-full sm:w-auto text-white dark:text-white font-black px-8 py-4 rounded-2xl dark:bg-blue-800 hover:bg-blue-200 transition-all active:scale-95 shadow-lg shadow-blue-100 dark:shadow-none"
                    >
                      {isChecking ? (
                        <Loader2 className="animate-spin mx-auto" size={20} />
                      ) : (
                        "Enroll Now →"
                      )}
                    </button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5 transition-colors duration-300">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
                    Rate this Course
                  </h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="transition-transform active:scale-90 outline-none"
                      >
                        <Star
                          size={32}
                          className={`${star <= userRating ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-slate-600"} transition-colors`}
                        />
                      </button>
                    ))}
                    {userRating > 0 && (
                      <span className="ml-3 font-bold text-amber-500 self-center bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full text-sm">
                        {userRating}/5
                      </span>
                    )}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl min-h-30 focus-visible:ring-[#0a348f] dark:focus-visible:ring-blue-500"
                  />
                  <Button
                    className="bg-[#0a348f] dark:bg-blue-600 text-white font-bold rounded-xl px-8 h-12 hover:bg-blue-800 dark:hover:bg-blue-700"
                    disabled={!userRating}
                  >
                    Submit Review <Send size={16} className="ml-2" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT — YouTube Playlist */}
        <div className="lg:w-100 shrink-0 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:overflow-y-auto border-l border-slate-200 dark:border-slate-800 transition-colors duration-300">
          {/* Playlist Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur transition-colors duration-300">
            <div className="flex items-center gap-2 mb-1.5">
              <ListVideo
                size={20}
                className="text-[#0a348f] dark:text-blue-400"
              />
              <span className="font-bold text-slate-800 dark:text-slate-100 text-base">
                Course Content
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1">
              {course.title}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#0a348f] dark:bg-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: isEnrolled
                      ? `${Math.round(((activeIndex + 1) / lecturesList.length) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {isEnrolled
                  ? `${activeIndex + 1}/${lecturesList.length}`
                  : `0/${lecturesList.length}`}
              </span>
            </div>
          </div>

          {/* Lecture List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {lecturesList.length > 0 ? (
              lecturesList.map((lec: any, idx: number) => {
                const videoSrc = lec.videoUrl || lec.url;
                const isActive = activeVideo === videoSrc;
                const isLocked = !isEnrolled;

                return (
                  <div
                    key={lec._id || idx}
                    onClick={() => handlePlayVideo(videoSrc, idx)}
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all group ${
                      isActive
                        ? "bg-blue-50/50 dark:bg-slate-800/80 border-l-4 border-l-[#0a348f] dark:border-l-blue-500"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Index / Play indicator */}
                    <div className="w-6 shrink-0 flex justify-center">
                      {isActive ? (
                        <div className="flex gap-0.75 items-end h-4">
                          <div
                            className="w-1 bg-[#0a348f] dark:bg-blue-400 rounded-full animate-[bounce_0.8s_ease-in-out_infinite]"
                            style={{ height: "60%" }}
                          />
                          <div
                            className="w-1 bg-[#0a348f] dark:bg-blue-400 rounded-full animate-[bounce_0.8s_ease-in-out_0.2s_infinite]"
                            style={{ height: "100%" }}
                          />
                          <div
                            className="w-1 bg-[#0a348f] dark:bg-blue-400 rounded-full animate-[bounce_0.8s_ease-in-out_0.4s_infinite]"
                            style={{ height: "40%" }}
                          />
                        </div>
                      ) : isLocked ? (
                        <Lock
                          size={14}
                          className="text-slate-400 dark:text-slate-500"
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 group-hover:hidden">
                          {idx + 1}
                        </span>
                      )}
                      {!isActive && !isLocked && (
                        <Play
                          size={14}
                          className="text-[#0a348f] dark:text-blue-400 hidden group-hover:block"
                          fill="currentColor"
                        />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div
                      className={`w-24 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden transition-all ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/40 ring-2 ring-[#0a348f] dark:ring-blue-500"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}
                    >
                      {isLocked ? (
                        <Lock
                          size={18}
                          className="text-slate-300 dark:text-slate-600"
                        />
                      ) : isActive ? (
                        <Play
                          size={20}
                          className="text-[#0a348f] dark:text-blue-400"
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-[#0a348f] dark:group-hover:text-blue-400 transition-colors"
                        />
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0 pr-2">
                      <p
                        className={`text-sm font-bold leading-snug line-clamp-2 transition-colors ${
                          isActive
                            ? "text-[#0a348f] dark:text-blue-400"
                            : isLocked
                              ? "text-slate-500 dark:text-slate-500"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      >
                        {lec.title || `Lecture ${idx + 1}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1 uppercase tracking-wider">
                        <Clock size={10} />
                        Video Lesson
                        {isLocked && (
                          <span className="ml-1 text-amber-500 flex items-center gap-0.5">
                            <Lock size={8} /> Locked
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Clock
                    className="text-slate-400 dark:text-slate-500"
                    size={24}
                  />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold">
                  Curriculum coming soon
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  The instructor is preparing the content.
                </p>
              </div>
            )}
          </div>

          {/* Enroll CTA */}
          {!isEnrolled && (
            <div className="sticky bottom-0 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <Button
                onClick={handleEnrollClick}
                disabled={isChecking}
                className="w-full bg-[#0a348f] dark:bg-blue-600 text-white font-black py-6 rounded-2xl hover:bg-blue-800 dark:hover:bg-blue-700 transition-all active:scale-95 text-base shadow-xl shadow-blue-100 dark:shadow-none"
              >
                {isChecking ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Enroll for PKR ${course.price}`
                )}
              </Button>
              <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} className="text-green-500" /> Secure SSL
                Payment
              </p>
            </div>
          )}

          {/* Already Enrolled badge */}
          {isEnrolled && (
            <div className="sticky bottom-0 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
              <div className="flex items-center justify-center gap-2 py-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl transition-colors duration-300">
                <CheckCircle2
                  size={18}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-green-700 dark:text-green-400 font-bold text-sm">
                  You have full access
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
