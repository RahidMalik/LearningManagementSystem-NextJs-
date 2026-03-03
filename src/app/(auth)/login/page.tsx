"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { handleGoogleAuth } from "@/utils/GoogleAuth";
import { toast } from "react-hot-toast";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import { apiClient } from "@/types/apiClient"; // Check karein path sahi ho

export default function Login() {
  const router = useRouter();
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!Email || !Password) {
      toast.error("Please fill in all fields.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  // --- Google Login Handler ---
  const onGoogleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Connecting to Google...");

    try {
      const response = await handleGoogleAuth();
      if (response?.user) {
        const { user } = response;
        const res = await api.googleLogin({
          email: user.email || "",
          name: user.displayName || "",
          uid: user.uid,
          photoURL: user.photoURL || "",
        });

        if (res.success) {
          apiClient.setToken(res.token || null);

          toast.success("Welcome back!", { id: loadingToast });
          router.push("/");
          router.refresh();
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Google login failed.", {
        id: loadingToast,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Email/Password Login Handler ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Checking credentials...");
    try {
      const res = await api.login(Email, Password);
      if (res.success) {
        apiClient.setToken((res as any).token || null);

        toast.success("Login Successful", { id: loadingToast });

        router.push("/");
        setTimeout(() => router.refresh(), 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main container uses global background colors now
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Text */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#0a348f] dark:text-blue-400 transition-colors duration-300">
            Sign in
          </h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors duration-300">
            Please Sign in with your account
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1 text-slate-700 dark:text-slate-300 transition-colors duration-300">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 md:h-14 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 focus-visible:ring-2 focus-visible:ring-[#0a348f] dark:focus-visible:ring-blue-500 transition-all duration-300"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1 text-slate-700 dark:text-slate-300 transition-colors duration-300">
              Password
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 md:h-14 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-4 pr-12 focus-visible:ring-2 focus-visible:ring-[#0a348f] dark:focus-visible:ring-blue-500 transition-all duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors duration-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a348f] dark:bg-blue-600 text-white hover:bg-blue-900 dark:hover:bg-blue-700 h-12 md:h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-50 dark:shadow-none transition-all active:scale-95 duration-300"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "SIGN IN"}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="grow border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"></div>
          <span className="shrink mx-4 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest transition-colors duration-300">
            Or
          </span>
          <div className="grow border-t border-slate-200 dark:border-slate-800 transition-colors duration-300"></div>
        </div>

        {/* Google Button */}
        <Button
          type="button"
          onClick={onGoogleClick}
          disabled={isLoading}
          variant="outline"
          className="w-full h-12 md:h-14 rounded-xl font-bold text-lg flex gap-3 text-slate-700 dark:text-slate-200 bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign In with Google</span>
        </Button>

        {/* Signup Link */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2 transition-colors duration-300">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-[#0a348f] dark:text-blue-400 font-bold hover:underline transition-colors duration-300"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
