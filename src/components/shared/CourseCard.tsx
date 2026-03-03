"use client";

import { Star, PlayCircle, Tag, ArrowUpRight, Lock } from "lucide-react";
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
  progress,
}: CourseProps) => {
  const router = useRouter();
  const isFree = price === 10;
  const isEnrolled = typeof progress === "number";

  return (
    <div
      onClick={() => router.push(`/course/${id}`)}
      className="group relative cursor-pointer select-none"
    >
      {/* Glow shadow on hover */}
      <div className="absolute -inset-0.5 bg-linear-to-br from-blue-600/0 via-blue-500/0 to-indigo-500/0 group-hover:from-blue-600/20 group-hover:via-blue-500/10 group-hover:to-indigo-500/20 dark:group-hover:from-blue-500/30 dark:group-hover:via-blue-400/15 dark:group-hover:to-indigo-500/30 rounded-[28px] blur-xl transition-all duration-500 -z-10" />

      <div className="relative bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-[24px] overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_24px_48px_-8px_rgba(10,52,143,0.18)] dark:group-hover:shadow-[0_24px_48px_-8px_rgba(59,130,246,0.15)]">
        {/* ── IMAGE ── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "16/10" }}
        >
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-all duration-700 group-hover:scale-110"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Category pill — top left */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Tag size={9} className="fill-white" />
              {category}
            </span>
          </div>

          {/* Rating — top right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-amber-400/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-amber-950">
              <Star size={9} fill="currentColor" stroke="none" />
              4.9
            </span>
          </div>

          {/* Price badge — bottom left */}
          <div className="absolute bottom-3 left-3">
            {isFree ? (
              <span className="bg-green-500 text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Free
              </span>
            ) : (
              <span className="bg-white dark:bg-zinc-900 text-[#0a348f] dark:text-blue-400 text-sm font-black px-3 py-1.5 rounded-full shadow-lg">
                PKR {price}
              </span>
            )}
          </div>

          {/* Arrow icon — appears on hover, bottom right */}
          <div className="absolute bottom-3 right-3 w-9 h-9 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl">
            <ArrowUpRight
              size={16}
              className="text-[#0a348f] dark:text-blue-400"
            />
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="p-5 space-y-3">
          {/* Instructor */}
          <div className="flex items-center gap-2">
            {/* Avatar placeholder with initials */}
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-[#0a348f] to-blue-400 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-black text-white uppercase">
                {instructor.charAt(0)}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate">
              {instructor}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-black text-[16px] leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#0a348f] dark:group-hover:text-blue-400 transition-colors duration-300">
            {title}
          </h3>

          {/* Progress bar — only if enrolled */}
          {isEnrolled && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Progress
                </span>
                <span className="text-[#0a348f] dark:text-blue-400">
                  {progress}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-[#0a348f] to-blue-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-zinc-500">
              <PlayCircle
                size={14}
                className="text-[#0a348f] dark:text-blue-400"
              />
              <span className="text-[11px] font-bold">
                {videoCount} Lessons
              </span>
            </div>

            {/* CTA */}
            <div
              className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300
              ${
                isEnrolled
                  ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400"
                  : isFree
                    ? "bg-blue-50 dark:bg-blue-500/10 text-[#0a348f] dark:text-blue-400 group-hover:bg-[#0a348f] group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white"
                    : "bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:bg-[#0a348f] group-hover:text-white dark:group-hover:bg-blue-500 dark:group-hover:text-white"
              }
            `}
            >
              {isEnrolled ? (
                <>▶ Continue</>
              ) : isFree ? (
                <>Enroll Free</>
              ) : (
                <>
                  <Lock size={10} /> Buy Now
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom shimmer line on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-blue-600 via-indigo-500 to-blue-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </div>
    </div>
  );
};
