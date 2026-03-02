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
          api.checkEnrollment(id).catch(() => null),
        ]);

        if (courseRes.success) {
          setCourse(courseRes.data ?? null);
        }

        // ✅ Saare possible response formats handle
        const raw = enrollRes as any;
        const enrolled =
          raw?.isEnrolled === true ||
          raw?.data?.isEnrolled === true ||
          (raw?.success === true && raw?.isEnrolled === true);

        setIsEnrolled(!!enrolled);
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
    if (isEnrolled) {
      toast.error("You are already enrolled", {
        duration: 3000,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to enroll!");
      router.push(`/login?redirect=/course/${id}`);
      return;
    }

    setIsChecking(true);
    router.push(`/payment/${id}`);
  };

  const handlePlayVideo = (videoUrl: string) => {
    if (!isEnrolled) {
      toast.error("Please enroll first!");
      return;
    }
    setActiveVideo(videoUrl);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0a348f] mb-4" size={40} />
        <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
          Fetching Course...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="h-screen flex items-center justify-center font-bold text-red-500">
        Course not found!
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-lg text-slate-800 line-clamp-1">
          {course.title}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group border-4 border-slate-100 flex items-center justify-center">
            {activeVideo ? (
              <video
                ref={videoRef}
                controls
                controlsList="nodownload"
                className="w-full h-full object-cover rounded-[2.2rem]"
              >
                <source src={activeVideo} type="video/mp4" />
              </video>
            ) : (
              <>
                <Image
                  src={
                    course.thumbnail ||
                    course.image ||
                    "https://placehold.co/800x450?text=Course+Thumbnail"
                  }
                  alt={course.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  onClick={() => {
                    if (lecturesList.length > 0) {
                      handlePlayVideo(
                        lecturesList[0].videoUrl || lecturesList[0].url,
                      );
                    } else {
                      toast.error("Koi video available nahi hai.");
                    }
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
                >
                  <PlayCircle className="text-white w-24 h-24 hover:scale-110 transition-transform drop-shadow-2xl" />
                </div>
              </>
            )}
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-14 gap-8 overflow-x-auto no-scrollbar">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold text-md px-0"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="lessons"
                className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold text-md px-0"
              >
                Lessons ({lecturesList.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold text-md px-0"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="py-8 space-y-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Badge className="bg-[#0a348f]">New Release</Badge>
                    <Badge
                      variant="outline"
                      className="border-[#0a348f] text-[#0a348f]"
                    >
                      Best Seller
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 text-lg">
                    <User size={20} className="text-[#0a348f]" />
                    By{" "}
                    <span className="font-semibold text-[#0a348f]">
                      {course.instructor || "Admin"}
                    </span>
                  </p>
                </div>
                <div className="bg-[#0a348f] text-white px-6 py-2 rounded-2xl text-3xl font-bold shadow-lg shadow-blue-200">
                  PKR {course.price}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-xl whitespace-pre-wrap">
                {course.description ||
                  "Master the skills needed for this course with our comprehensive curriculum."}
              </p>
            </TabsContent>

            <TabsContent value="lessons" className="py-6">
              {lecturesList.length > 0 ? (
                <div className="space-y-3">
                  {lecturesList.map((lec: any, idx: number) => {
                    const videoSrc = lec.videoUrl || lec.url;
                    const isActive = activeVideo === videoSrc;
                    return (
                      <div
                        key={lec._id || idx}
                        onClick={() => handlePlayVideo(videoSrc)}
                        className={`flex justify-between items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${isActive ? "border-[#0a348f] bg-blue-50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-3 rounded-xl ${isEnrolled ? "bg-blue-100 text-[#0a348f]" : "bg-slate-100 text-slate-400"}`}
                          >
                            {isEnrolled ? (
                              <PlayCircle size={24} />
                            ) : (
                              <Lock size={24} />
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-bold ${isEnrolled ? "text-slate-900" : "text-slate-500"} ${isActive ? "text-[#0a348f]" : ""}`}
                            >
                              {idx + 1}. {lec.title || `Lecture ${idx + 1}`}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                              <Clock size={12} /> Video Lesson
                            </p>
                          </div>
                        </div>
                        <div>
                          {isEnrolled ? (
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? "bg-[#0a348f] text-white" : "text-[#0a348f] bg-blue-100"}`}
                            >
                              {isActive ? "Playing" : "Play"}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                  <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500 font-medium">
                    Curriculum is being updated for {course.title}.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="py-8 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase italic">
                    Rate this Course
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Your feedback helps other students.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={36}
                        className={`${star <= userRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} transition-colors`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-4 font-bold text-[#0a348f] self-center">
                      {userRating}/5
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell us what you liked or disliked about this course..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-35 rounded-[1.5rem] border-slate-200 focus:ring-[#0a348f] focus:border-[#0a348f] p-4 text-lg"
                  />
                  <Button
                    className="bg-[#0a348f] hover:bg-blue-900 text-white rounded-full px-8 py-6 h-auto font-bold flex gap-2"
                    disabled={!userRating}
                  >
                    Submit Review <Send size={18} />
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
            <h2 className="font-black text-2xl text-slate-800 tracking-tight uppercase">
              Course Features
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PlayCircle, label: `${lecturesList.length} Videos` },
                { icon: Award, label: "Certificate" },
                { icon: Clock, label: "Lifetime" },
                { icon: CheckCircle2, label: "Access" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 rounded-[2rem] flex flex-col items-center text-center group hover:bg-[#0a348f] transition-all cursor-default"
                >
                  <item.icon
                    className="text-[#0a348f] group-hover:text-white mb-2 transition-colors"
                    size={30}
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <Button
                onClick={handleEnrollClick}
                disabled={isChecking}
                className={`w-full py-8 rounded-[2rem] font-black text-xl shadow-2xl uppercase italic active:scale-95 transition-all ${
                  isEnrolled
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-[#0a348f] hover:bg-blue-900 text-white"
                }`}
              >
                {isChecking ? (
                  <Loader2 className="animate-spin" />
                ) : isEnrolled ? (
                  <span className="flex items-center gap-2">
                    <Check /> Already Enrolled
                  </span>
                ) : (
                  "Enroll Now"
                )}
              </Button>
              {!isEnrolled && (
                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center justify-center gap-1">
                  <Lock size={12} /> Secure Payment Gateway
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
