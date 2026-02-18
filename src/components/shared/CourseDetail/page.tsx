import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Award,
  Star,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const CourseDetail = () => {
  const [userRating, setUserRating] = useState(0);
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
      {/* LEFT COLUMN: Video & Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Video Player */}
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl group">
          <img
            src="/video/CourseVideo.png"
            alt="Course Thumbnail"
            className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle className="text-white w-20 h-20 cursor-pointer hover:scale-110 transition-transform drop-shadow-2xl" />
          </div>
        </div>

        {/* 2. Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b rounded-none h-12 gap-8 overflow-x-auto no-scrollbar">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="lessons"
              className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold"
            >
              Lessons
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:border-b-4 data-[state=active]:border-[#0a348f] rounded-none bg-transparent font-bold"
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW CONTENT */}
          <TabsContent
            value="overview"
            className="py-6 space-y-6 animate-in fade-in duration-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Graphic Design Masterclass
                </h1>
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <User size={16} /> By{" "}
                  <span className="font-semibold text-[#0a348f]">
                    Syed Hasnain
                  </span>
                </p>
              </div>
              <span className="text-3xl font-bold text-[#0a348f]">$72</span>
            </div>

            <p className="text-slate-600 leading-relaxed text-lg">
              Master the world of visual communication. This course takes you
              from a complete beginner to a professional designer using
              industry-standard tools like Adobe Photoshop, Illustrator, and
              Figma.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="text-green-500" size={20} />
                <span>Learn UI/UX Principles</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="text-green-500" size={20} />
                <span>Logo & Branding Projects</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4">
              {["Adobe", "Figma", "Logo Design", "UI/UX"].map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 border-none"
                >
                  {s}
                </Badge>
              ))}
            </div>
          </TabsContent>

          {/* LESSONS CONTENT */}
          <TabsContent
            value="lessons"
            className="py-6 animate-in slide-in-from-left-4 duration-500"
          >
            {[1, 2, 3].map((ch) => (
              <div
                key={ch}
                className="mb-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-[#0a348f]/30 transition-colors"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800">
                    Chapter {ch}: Fundamentals
                  </h3>
                  <Badge className="bg-blue-50 text-[#0a348f] border-none">
                    4 Videos
                  </Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3 text-sm font-medium">
                      <PlayCircle size={18} className="text-[#0a348f]" />
                      <span>Introduction to Tools</span>
                    </div>
                    <span className="text-xs text-muted-foreground">12:45</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* REVIEWS CONTENT (With Input) */}
          <TabsContent
            value="reviews"
            className="py-6 space-y-8 animate-in fade-in duration-500"
          >
            {/* Write a Review Form */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <h3 className="font-bold text-xl text-slate-800">
                Share Your Experience
              </h3>

              <div className="flex gap-2 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    className="cursor-pointer transition-colors"
                    fill={star <= userRating ? "currentColor" : "none"}
                    onClick={() => setUserRating(star)}
                  />
                ))}
                <span className="text-sm text-slate-500 ml-2 mt-1">
                  ({userRating || 0} / 5)
                </span>
              </div>

              <Textarea
                placeholder="What did you like or dislike about this course?"
                className="rounded-2xl border-none bg-white min-h-30 focus-visible:ring-[#0a348f] p-4 text-slate-700 shadow-inner"
              />

              <div className="flex justify-end">
                <Button className="bg-[#0a348f] hover:bg-blue-800 rounded-2xl px-10 py-6 font-bold text-md shadow-lg shadow-blue-200">
                  Post Review
                </Button>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xl text-slate-800">
                  Student Feedback
                </h3>
                <div className="text-[#0a348f] font-bold text-sm cursor-pointer">
                  View All
                </div>
              </div>

              {[1, 2].map((review) => (
                <div key={review} className="flex gap-4 group">
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shrink-0 flex items-center justify-center font-bold text-slate-400 shadow-sm">
                    UA
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-800">Fawais Ahmad</h4>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      The way of teaching is brilliant. I have learned more in 2
                      weeks than I did in 3 months of self-study. Highly
                      recommended!
                    </p>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      2 days ago
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: Sidebar Stats */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
          <div className="space-y-4">
            <h2 className="font-bold text-2xl text-slate-800">
              Course Features
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-3xl flex flex-col items-center text-center group hover:bg-[#0a348f] transition-all">
                <PlayCircle
                  className="text-[#0a348f] group-hover:text-white mb-2 transition-colors"
                  size={28}
                />
                <span className="text-xs font-bold text-slate-700 group-hover:text-white">
                  80+ Lectures
                </span>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-3xl flex flex-col items-center text-center group hover:bg-[#0a348f] transition-all">
                <Award
                  className="text-[#0a348f] group-hover:text-white mb-2 transition-colors"
                  size={28}
                />
                <span className="text-xs font-bold text-slate-700 group-hover:text-white">
                  Certificate
                </span>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-3xl flex flex-col items-center text-center group hover:bg-[#0a348f] transition-all">
                <Clock
                  className="text-[#0a348f] group-hover:text-white mb-2 transition-colors"
                  size={28}
                />
                <span className="text-xs font-bold text-slate-700 group-hover:text-white">
                  12 Hours
                </span>
              </div>
              <div className="p-4 bg-blue-50/50 rounded-3xl flex flex-col items-center text-center group hover:bg-[#0a348f] transition-all">
                <CheckCircle2
                  className="text-[#0a348f] group-hover:text-white mb-2 transition-colors"
                  size={28}
                />
                <span className="text-xs font-bold text-slate-700 group-hover:text-white">
                  Lifetime Access
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={() => navigate("/enroll/1")}
              className="w-full bg-[#0a348f] hover:bg-blue-900 text-white py-8 rounded-[1.5rem] font-bold text-xl shadow-xl shadow-blue-200 transition-all active:scale-95"
            >
              ENROLL NOW
            </Button>
            <p className="text-center text-xs text-muted-foreground font-medium">
              30-Day Money-Back Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
