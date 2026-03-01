"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import Image from "next/image";
import { api, ICourse } from "@/services/api";

export default function CourseDetailPage() {
  const [course, setCourse] = useState<ICourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0); // Star rating state
  const [reviewText, setReviewText] = useState(""); // Textarea state

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await api.getCourseDetails(id);
        if (res.success) {
          setCourse(res.data ?? null);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseData();
  }, [id]);

  const handleEnrollClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push(`/login?redirect=/course/${id}`);
      return;
    }

    // Agar token hai, to payment page par bhejo
    router.push(`/payment/${id}`);
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
    <div className="bg-slate-50 min-h-screen">
      {/* --- TOP NAVIGATION --- */}
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

      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Placeholder */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group border-4 border-white">
            <Image
              src={course.image || "/video/CourseVideo.png"}
              alt={course.title}
              fill
              className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="text-white w-24 h-24 cursor-pointer hover:scale-110 transition-transform drop-shadow-2xl" />
            </div>
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
                Lessons
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold text-md px-0"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
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
                      {course.instructor}
                    </span>
                  </p>
                </div>
                <div className="bg-[#0a348f] text-white px-6 py-2 rounded-2xl text-3xl font-bold shadow-lg shadow-blue-200">
                  PKR {course.price}
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed text-xl">
                {course.description ||
                  "Master the skills needed for this course with our comprehensive curriculum."}
              </p>
            </TabsContent>

            {/* LESSONS TAB */}
            <TabsContent value="lessons" className="py-8">
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                <Clock className="mx-auto text-slate-300 mb-4" size={48} />
                <p className="text-slate-500 font-medium">
                  Curriculum is being updated for {course.title}.
                </p>
              </div>
            </TabsContent>

            {/* REVIEWS TAB (Stars and Textarea added here) */}
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

                {/* Star Rating Logic */}
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={36}
                        className={`${
                          star <= userRating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-slate-200"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  {userRating > 0 && (
                    <span className="ml-4 font-bold text-[#0a348f] self-center">
                      {userRating}/5
                    </span>
                  )}
                </div>

                {/* Review Textarea */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Tell us what you liked or disliked about this course..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="min-h-37.5 rounded-[1.5rem] border-slate-200 focus:ring-[#0a348f] focus:border-[#0a348f] p-4 text-lg"
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

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8">
            <h2 className="font-black text-2xl text-slate-800 tracking-tight uppercase">
              Course Features
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PlayCircle, label: "Videos" },
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
                className="w-full bg-[#0a348f] hover:bg-blue-900 text-white py-8 rounded-[2rem] font-black text-xl shadow-2xl uppercase italic active:scale-95 transition-transform"
              >
                Enroll Now
              </Button>
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                Secure Payment Gateway
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
