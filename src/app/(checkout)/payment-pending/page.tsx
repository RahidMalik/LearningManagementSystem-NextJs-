// src/app/(checkout)/payment-pending/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock,
  CheckCircle,
  ArrowRight,
  Home,
  BookOpen,
  Mail,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function PaymentPendingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const method = searchParams.get("method") || "Wallet";

  const [step, setStep] = useState(0);

  // Animate steps sequentially
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1300),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { label: "Receipt received", done: step >= 1 },
    { label: "Sent for verification", done: step >= 2 },
    { label: "Awaiting confirmation", done: step >= 3, active: true },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-75 h-75 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Top icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock size={40} className="text-amber-400" strokeWidth={1.5} />
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping" />
            <div className="absolute -inset-3 rounded-full border border-amber-500/10 animate-ping [animation-delay:0.3s]" />
          </div>
        </div>

        {/* Main card */}
        <div className="backdrop-blur border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              {method} Payment
            </p>
            <h1 className="text-2xl font-black text-white leading-tight">
              Payment has been received just wait!
            </h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We are currently verifying your payment.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3 py-2">
            {steps.map((s, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  s.done ? "opacity-100" : "opacity-30"
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    s.done
                      ? s.active
                        ? "bg-amber-500/20 border border-amber-500/50"
                        : "bg-green-500/20 border border-green-500/50"
                      : "bg-zinc-800 border border-zinc-700"
                  }`}
                >
                  {s.done && !s.active ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : s.done && s.active ? (
                    <Clock
                      size={12}
                      className="text-amber-400 animate-spin animation-duration-[3s]"
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    s.active && s.done
                      ? "text-amber-300"
                      : s.done
                        ? "text-zinc-300"
                        : "text-zinc-600"
                  }`}
                >
                  {s.label}
                </span>
                {s.active && s.done && (
                  <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    PENDING
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-3">
            <Mail size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-xs font-bold mb-0.5">
                Your will receive an email.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                We will send you an email once your payment is confirmed. then
                you will be able to access your course.
              </p>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-center gap-2 text-zinc-600 text-[11px]">
            <Shield size={12} className="text-zinc-700" />
            <span>Your payment is secure</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 space-y-3">
          {courseId && (
            <Link
              href={`/course/${courseId}`}
              className="flex items-center justify-center gap-2 w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-100 transition-all active:scale-95 text-sm"
            >
              <BookOpen size={16} />
              Checkout Course
              <ArrowRight size={16} />
            </Link>
          )}
          <Link
            href="/course/my-courses"
            className="flex items-center justify-center gap-2 w-full bg-zinc-900 text-zinc-300 border border-white/10 font-semibold py-4 rounded-2xl hover:bg-zinc-800 transition-all text-sm"
          >
            <Home size={15} />
            My Courses
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-700 text-[11px] mt-5">
          Need help?{" "}
          <a
            href="mailto:malikrahid011@gmail.com"
            className="text-zinc-500 underline hover:text-zinc-300 transition-colors"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
