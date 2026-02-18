"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  PlayCircle,
  Award,
  Star,
  Clock,
  User,
  CheckCircle2,
  ChevronLeft,
} from "lucide-react";

export default function CourseDetailPage() {
  const [userRating, setUserRating] = useState(0);
  const params = useParams();
  const router = useRouter();
  const id = params.id;

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
        <h1 className="font-bold text-lg text-slate-800">Course Details</h1>
      </div>

      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
        {/* --- LEFT COLUMN: VIDEO & CONTENT --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Video Player */}
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-black shadow-2xl group border-4 border-white">
            <Image
              src="/video/CourseVideo.png"
              alt="Course Thumbnail"
              fill
              className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <PlayCircle className="text-white w-24 h-24 cursor-pointer hover:scale-110 transition-transform drop-shadow-2xl" />
            </div>
          </div>

          {/* 2. Tabs System */}
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

            {/* TAB: OVERVIEW */}
            <TabsContent
              value="overview"
              className="py-8 space-y-6 animate-in fade-in duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold text-slate-900 leading-tight">
                    {id === "1" ? "Graphic Design Masterclass" : "Course " + id}
                  </h1>
                  <p className="text-muted-foreground flex items-center gap-2 text-lg">
                    <User size={20} className="text-[#0a348f]" />
                    By{" "}
                    <span className="font-semibold text-[#0a348f]">
                      Syed Hasnain
                    </span>
                  </p>
                </div>
                <div className="bg-[#0a348f] text-white px-6 py-2 rounded-2xl text-3xl font-bold shadow-lg shadow-blue-200">
                  $72
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-xl">
                Master the world of visual communication. This course takes you
                from a complete beginner to a professional designer using
                industry-standard tools.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Learn UI/UX Principles", "Logo & Branding Projects"].map(
                  (item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                      <span className="font-medium text-slate-700">{item}</span>
                    </div>
                  ),
                )}
              </div>
            </TabsContent>

            {/* TAB: LESSONS */}
            <TabsContent
              value="lessons"
              className="py-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500"
            >
              {[1, 2, 3].map((ch) => (
                <div
                  key={ch}
                  className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#0a348f] transition-all"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-xl">
                      Chapter {ch}: Fundamentals
                    </h3>
                    <Badge className="bg-blue-50 text-[#0a348f] border-none">
                      4 Videos
                    </Badge>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* TAB: REVIEWS (WITH TEXTAREA) */}
            <TabsContent
              value="reviews"
              className="py-8 space-y-10 animate-in fade-in duration-500"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-2xl text-slate-800">
                  Share Your Experience
                </h3>

                <div className="flex items-center gap-2 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={28}
                      className="cursor-pointer transition-transform hover:scale-110"
                      fill={star <= userRating ? "currentColor" : "none"}
                      onClick={() => setUserRating(star)}
                    />
                  ))}
                  <span className="text-slate-400 font-bold ml-2">
                    ({userRating}/5)
                  </span>
                </div>

                <Textarea
                  placeholder="What did you like or dislike?..."
                  className="rounded-[1.5rem] border-none bg-slate-50 min-h-30 focus-visible:ring-2 focus-visible:ring-[#0a348f] p-5 text-slate-700 shadow-inner resize-none"
                />

                <div className="flex justify-end">
                  <Button className="bg-[#0a348f] hover:bg-blue-800 rounded-2xl px-12 py-7 font-bold text-lg shadow-xl shadow-blue-100">
                    Post Review
                  </Button>
                </div>
              </div>

              {/* Feedback List */}
              <div className="space-y-6">
                {[1, 2].map((review) => (
                  <div key={review} className="flex gap-5 p-2">
                    <div className="h-16 w-16 rounded-2xl bg-slate-200 shrink-0 flex items-center justify-center font-black text-slate-400 text-xl border-2 border-white">
                      {review === 1 ? "FA" : "UA"}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-lg text-slate-800">
                          Fawais Ahmad
                        </h4>
                        <div className="flex text-amber-400 gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed italic">
                        "Brilliant teaching way!"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR --- */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 overflow-hidden">
            <h2 className="font-black text-2xl text-slate-800 tracking-tight uppercase">
              Course Features
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: PlayCircle, label: "80+ Lectures" },
                { icon: Award, label: "Certificate" },
                { icon: Clock, label: "12 Hours" },
                { icon: CheckCircle2, label: "Lifetime Access" },
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

            <div className="space-y-4 pt-6">
              <Button
                onClick={() => router.push(`/enroll/${id}`)}
                className="w-full bg-[#0a348f] hover:bg-blue-900 text-white py-8 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-300 uppercase italic active:scale-95 transition-transform"
              >
                Enroll Now
              </Button>
              <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                30-Day Money-Back Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
