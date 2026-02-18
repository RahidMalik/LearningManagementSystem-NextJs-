"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  // --- States ---
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- Hydration Fix ---
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleResetPassword = async () => {
    // 1. Validations
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error("Use at least 8 characters with Upper & Lowercase.");
      return;
    }

    // 2. API Call
    setIsLoading(true);
    const loadingToast = toast.loading("Updating password...");

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Password updated successfully!", { id: loadingToast });

      // 3. Redirect to your Success Route
      router.push("/reset-success");
    } catch (error: any) {
      toast.error("Failed to update password. Try again.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-[#0a348f]" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Reset Password
          </h1>
          <p className="text-sm text-slate-500 px-8">
            Set a strong password to protect your account.
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="relative group">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-14 rounded-2xl bg-slate-50 border-none px-5 focus-visible:ring-2 focus-visible:ring-[#0a348f]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a348f] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="h-14 rounded-2xl bg-slate-50 border-none px-5 focus-visible:ring-2 focus-visible:ring-[#0a348f]/20 transition-all"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-2">
          <Button
            onClick={handleResetPassword}
            disabled={isLoading}
            className="w-full bg-[#0a348f] hover:bg-blue-900 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>PROCESSING</span>
              </div>
            ) : (
              "DONE"
            )}
          </Button>

          <button
            onClick={() => router.push("/login")}
            disabled={isLoading}
            className="w-full text-sm font-semibold text-slate-400 hover:text-[#0a348f] transition-colors py-2"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
