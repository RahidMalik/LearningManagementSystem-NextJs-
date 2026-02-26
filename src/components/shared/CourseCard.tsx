"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star, GraduationCap, PlayCircle, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CourseProps {
  id: string;
  title: string;
  instructor: string;
  image: string;
  videoCount?: number;
  price?: number;
  category?: string;
  progress?: number;
}

export const CourseCard = ({
  id,
  title,
  instructor,
  image,
  videoCount = 1,
  price = 0,
  category = "Tech",
  progress, // Progress prop ko destructure kiya
}: CourseProps) => {
  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/course/${id}`)}
      className="group relative bg-white border border-slate-100 rounded-[32px] overflow-hidden transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(10,52,143,0.15)] cursor-pointer"
    >
      {/* --- Image Section --- */}
      <div className="relative aspect-16/11 overflow-hidden m-2 rounded-[24px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Floating Instructor Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex items-center gap-2">
          <GraduationCap size={14} className="text-[#0a348f]" />
          <span className="text-[11px] font-bold text-slate-700 tracking-tight">
            {instructor}
          </span>
        </div>
      </div>

      {/* --- Content Section --- */}
      <CardContent className="p-5 pt-2 space-y-4">
        <div className="space-y-3">
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 bg-blue-50 text-[#0a348f] px-2.5 py-1 rounded-lg">
              <Tag size={12} className="fill-current" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {category}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <Star size={12} fill="#f59e0b" stroke="none" />
              <span className="text-[11px] font-bold text-amber-700">4.9</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-black text-[17px] leading-[1.2] text-slate-800 line-clamp-2 min-h-10.5 group-hover:text-[#0a348f] transition-colors">
            {title}
          </h3>

          {/* --- Progress Bar Section (Only shows if progress exists) --- */}
          {typeof progress === "number" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-tight">
                  Completion
                </span>
                <span className="text-[#0a348f]">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#0a348f] to-blue-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* --- Stats Row --- */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-slate-500">
            <PlayCircle size={16} className="text-[#0a348f]" />
            <span className="text-[11px] font-bold">{videoCount} Lessons</span>
          </div>

          {/* Price Tag */}
          <div className="text-right">
            <span className="text-[16px] font-black text-[#0a348f]">
              {price === 0 ? "FREE" : `PKR ${price}`}
            </span>
          </div>
        </div>

        {/* Bottom Button Indicator (Minimalized) */}
        <div className="bg-slate-50 group-hover:bg-[#0a348f] transition-all duration-500 rounded-2xl py-3 text-center">
          <span className="text-[12px] font-black text-slate-600 group-hover:text-white uppercase tracking-widest">
            {price === 0 ? "Enroll Now" : "View Details"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
