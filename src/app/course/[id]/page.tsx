"use client";

import { useState, useEffect, useRef } from "react";
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
  User,
  CheckCircle2,
  ChevronLeft,
  Send,
  Lock,
  Check,
  Play,
  ListVideo,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { api } from "@/services/api";

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
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    if (activeVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeVideo]);

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
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
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
      <div className="h-screen flex items-center justify-center font-bold text-red-500 bg-white dark:bg-zinc-950">
        Course not found!
      </div>
    );
  }

  return (
    <div className=" min-h-screen text-slate-900 dark:text-white">
      {/* Top Nav */}
      <div className="  border-b border-slate-100 dark:border-white/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
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
      <div className="flex flex-col lg:flex-row max-w-400 mx-auto">
        {/* LEFT — Video + Details */}
        <div className="flex-1 lg:max-w-[calc(100%-380px)]">
          {/* Video Player */}
          <div className=" w-full aspect-video">
            {activeVideo ? (
              <video
                ref={videoRef}
                controls
                controlsList="nodownload"
                className="w-full h-full"
                autoPlay
              >
                <source src={activeVideo} type="video/mp4" />
              </video>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={
                    course.thumbnail ||
                    course.image ||
                    "https://placehold.co/1280x720?text=Course"
                  }
                  alt={course.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
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
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors cursor-pointer"
                >
                  <div className="w-20 h-20  rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-2xl">
                    <Play size={32} className="text-black ml-1" fill="black" />
                  </div>
                </div>
                {!isEnrolled && (
                  <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
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
          <div className="px-4 py-4 bg-white dark:bg-zinc-950">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {activeVideo
                ? lecturesList[activeIndex]?.title || course.title
                : course.title}
            </h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-slate-500 dark:text-zinc-400">
                {course.instructor || "Admin"}
              </span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <span className="text-sm text-slate-500 dark:text-zinc-400">
                {lecturesList.length} videos
              </span>
              {isEnrolled && (
                <span className="bg-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full border border-green-500/30">
                  ✓ Enrolled
                </span>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pb-8 bg-white dark:bg-zinc-950">
            <Tabs defaultValue="overview">
              <TabsList className="bg-transparent border-b border-slate-100 dark:border-white/10 rounded-none w-full justify-start h-12 gap-6 mb-6">
                {["overview", "reviews"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-slate-400 dark:text-zinc-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#0a348f] dark:data-[state=active]:border-white rounded-none bg-transparent capitalize font-semibold text-sm px-0 pb-1"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-5 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className="bg-blue-600 text-white border-0">
                      New Release
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                      Best Seller
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                    {course.description ||
                      "Master the skills needed for this course with our comprehensive curriculum."}
                  </p>
                  <div className="flex gap-4 pt-2 flex-wrap">
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
                        className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 text-xs"
                      >
                        <item.icon
                          size={14}
                          className="text-[#0a348f] dark:text-blue-400"
                        />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {!isEnrolled && (
                  <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-5 flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        PKR {course.price}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                        One-time payment • Lifetime access
                      </p>
                    </div>
                    <button
                      onClick={handleEnrollClick}
                      disabled={isChecking}
                      className="bg-[#0a348f] dark:bg-white text-white dark:text-black font-black px-6 py-3 rounded-xl hover:bg-blue-800 dark:hover:bg-zinc-200 transition-all active:scale-95"
                    >
                      {isChecking ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        "Enroll Now →"
                      )}
                    </button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-6 space-y-5">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Rate this Course
                  </h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setUserRating(star)}
                        className="transition-transform active:scale-90"
                      >
                        <Star
                          size={32}
                          className={`${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-zinc-700"} transition-colors`}
                        />
                      </button>
                    ))}
                    {userRating > 0 && (
                      <span className="ml-2 font-bold text-yellow-500 self-center">
                        {userRating}/5
                      </span>
                    )}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 rounded-xl min-h-25 focus:border-[#0a348f] dark:focus:border-white"
                  />
                  <Button
                    className="bg-[#0a348f] dark:bg-white text-white dark:text-black font-bold rounded-xl px-6 hover:bg-blue-800 dark:hover:bg-zinc-200"
                    disabled={!userRating}
                  >
                    Submit Review <Send size={14} className="ml-2" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT — YouTube Playlist */}
        <div className="lg:w-95 lg:h-[calc(100vh-53px)] lg:sticky lg:top-13.25 lg:overflow-y-auto border-l border-slate-100 dark:border-white/10 bg-white dark:bg-zinc-950">
          {/* Playlist Header */}
          <div className="px-4 py-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-zinc-900/60 sticky top-0 z-10 backdrop-blur">
            <div className="flex items-center gap-2 mb-2">
              <ListVideo
                size={18}
                className="text-[#0a348f] dark:text-blue-400"
              />
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                Course Playlist
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {course.title}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex-1 bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#0a348f] dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: isEnrolled
                      ? `${Math.round(((activeIndex + 1) / lecturesList.length) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold">
                {isEnrolled
                  ? `${activeIndex + 1}/${lecturesList.length}`
                  : `0/${lecturesList.length}`}
              </span>
            </div>
          </div>

          {/* Lecture List */}
          <div className="divide-y divide-slate-50 dark:divide-white/5">
            {lecturesList.length > 0 ? (
              lecturesList.map((lec: any, idx: number) => {
                const videoSrc = lec.videoUrl || lec.url;
                const isActive = activeVideo === videoSrc;
                const isLocked = !isEnrolled;

                return (
                  <div
                    key={lec._id || idx}
                    onClick={() => handlePlayVideo(videoSrc, idx)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all group ${
                      isActive
                        ? "bg-blue-50 dark:bg-zinc-800"
                        : "hover:bg-slate-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {/* Index / Play indicator */}
                    <div className="w-8 shrink-0 flex items-center justify-center pt-0.5">
                      {isActive ? (
                        <div className="flex gap-0.5 items-end h-4">
                          <div
                            className="w-0.5 bg-[#0a348f] dark:bg-blue-400 animate-[bounce_0.8s_ease-in-out_infinite]"
                            style={{ height: "60%" }}
                          />
                          <div
                            className="w-0.5 bg-[#0a348f] dark:bg-blue-400 animate-[bounce_0.8s_ease-in-out_0.2s_infinite]"
                            style={{ height: "100%" }}
                          />
                          <div
                            className="w-0.5 bg-[#0a348f] dark:bg-blue-400 animate-[bounce_0.8s_ease-in-out_0.4s_infinite]"
                            style={{ height: "40%" }}
                          />
                        </div>
                      ) : isLocked ? (
                        <Lock
                          size={13}
                          className="text-slate-300 dark:text-zinc-600"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500 group-hover:hidden font-medium">
                          {idx + 1}
                        </span>
                      )}
                      {!isActive && !isLocked && (
                        <Play
                          size={13}
                          className="text-slate-600 dark:text-white hidden group-hover:block"
                          fill="currentColor"
                        />
                      )}
                    </div>

                    {/* Thumbnail */}
                    <div
                      className={`w-25 h-14 rounded-lg shrink-0 flex items-center justify-center overflow-hidden ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/40 ring-1 ring-[#0a348f] dark:ring-blue-500"
                          : "bg-slate-100 dark:bg-zinc-800"
                      }`}
                    >
                      {isLocked ? (
                        <Lock
                          size={16}
                          className="text-slate-300 dark:text-zinc-600"
                        />
                      ) : isActive ? (
                        <Play
                          size={20}
                          className="text-[#0a348f] dark:text-blue-400"
                          fill="currentColor"
                        />
                      ) : (
                        <Play
                          size={16}
                          className="text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors"
                        />
                      )}
                    </div>

                    {/* Title + meta */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          isActive
                            ? "text-[#0a348f] dark:text-white"
                            : isLocked
                              ? "text-slate-300 dark:text-zinc-600"
                              : "text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white"
                        }`}
                      >
                        {lec.title || `Lecture ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-1 flex items-center gap-1">
                        <Clock size={9} />
                        Video Lesson
                        {isLocked && (
                          <span className="ml-1 text-yellow-500 dark:text-yellow-600">
                            • Locked
                          </span>
                        )}
                      </p>
                    </div>

                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="text-[#0a348f] dark:text-blue-400 shrink-0 mt-1"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Clock
                  className="mx-auto text-slate-200 dark:text-zinc-700 mb-3"
                  size={36}
                />
                <p className="text-slate-400 dark:text-zinc-600 text-sm">
                  Curriculum coming soon
                </p>
              </div>
            )}
          </div>

          {/* Enroll CTA */}
          {!isEnrolled && (
            <div className="sticky bottom-0 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-slate-100 dark:border-white/10">
              <Button
                onClick={handleEnrollClick}
                disabled={isChecking}
                className="w-full bg-[#0a348f] dark:bg-white text-white dark:text-black font-black py-6 rounded-xl hover:bg-blue-800 dark:hover:bg-zinc-200 transition-all active:scale-95 text-base"
              >
                {isChecking ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  `Enroll for PKR ${course.price}`
                )}
              </Button>
              <p className="text-center text-[10px] text-slate-400 dark:text-zinc-600 mt-2 flex items-center justify-center gap-1">
                <Lock size={10} /> Secure Payment
              </p>
            </div>
          )}

          {/* Already Enrolled badge */}
          {isEnrolled && (
            <div className="sticky bottom-0 p-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-center gap-2 py-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                <Check
                  size={16}
                  className="text-green-600 dark:text-green-400"
                />
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  You are already enrolled
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
