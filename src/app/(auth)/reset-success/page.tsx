"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResetSuccess() {
  const router = useRouter();
  return (
    // 1. Full screen centering wrapper
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm text-center space-y-10 animate-in zoom-in-95 duration-500">
        {/* Success Icon Container */}
        <div className="flex justify-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#0a348f] rounded-full flex items-center justify-center border-8 border-slate-50 shadow-2xl">
            {/* Tick Mark */}
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold px-4 leading-tight">
            Password Updated Successfully!
          </h2>
          <p className="text-slate-500 text-sm">
            You can now use your new password to sign in to your account.
          </p>
        </div>

        {/* 2. Responsive Button */}
        <Button
          onClick={() => router.push("/login")}
          className="w-full bg-[#0a348f] hover:bg-blue-900 h-12 md:h-14 rounded-xl font-bold text-base md:text-lg cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-50"
        >
          BACK TO LOGIN
        </Button>
      </div>
    </div>
  );
}
