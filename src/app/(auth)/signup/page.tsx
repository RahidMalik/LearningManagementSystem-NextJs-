"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleGoogleAuth } from "@/utils/GoogleAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { apiClient } from "@/types/apiClient";

export default function SignUpPage() {
  const router = useRouter();

  // States
  const [fullName, setFullname] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [ConfirmPassword, setConfirmPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Password Show/Hide States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  // Validation Logic
  const validateForm = () => {
    if (!fullName || !Email || !Password || !ConfirmPassword) {
      toast.error("Please fill in all fields.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (Password !== ConfirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (Password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return false;
    }
    return true;
  };

  // Manual Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Creating account...");
    try {
      const res = await api.register(fullName, Email, Password);
      if (res.success) {
        apiClient.setToken((res as any).token);

        toast.success("Registration successful!", { id: loadingToast });
        router.push("/");

        setTimeout(() => router.refresh(), 100);
      }
    } catch (error: any) {
      toast.error(error.message || "Sign up failed", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign Up
  const onGoogleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Connecting to Google...");

    try {
      const response = await handleGoogleAuth();

      if (response && response.user) {
        const user = response.user;

        const res = await api.googleLogin({
          email: user.email || "",
          name: user.displayName || "",
          uid: user.uid,
          photoURL: user.photoURL || "",
        });

        if (res.success) {
          apiClient.setToken((res as any).token);
          toast.success("Welcome aboard!", { id: loadingToast });
          router.push("/");
          setTimeout(() => router.refresh(), 100);
        }
      }
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Popup closed before finishing.", { id: loadingToast });
      } else if (error.code === "auth/cancelled-popup-request") {
        toast.dismiss(loadingToast);
      } else {
        toast.error("Google login failed.", { id: loadingToast });
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm space-y-6 animate-in slide-in-from-right-4 duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#0a348f]">Sign Up</h1>
          <p className="text-slate-500 text-sm px-2">
            Create an account to begin your Learning Journey
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullname(e.target.value)}
            disabled={isLoading}
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />
          <Input
            type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />

          {/* Password Input with Toggle */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-14 rounded-xl border-none bg-slate-50 px-4 pr-12 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password Input with Toggle */}
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={ConfirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="h-14 rounded-xl border-none bg-slate-50 px-4 pr-12 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 md:h-14 bg-[#0a348f] hover:bg-[#0d275f] rounded-xl font-bold text-lg mt-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs uppercase">
            Or
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        <Button
          type="button"
          onClick={onGoogleClick}
          disabled={isLoading}
          variant="outline"
          className="w-full h-12 md:h-14 rounded-xl font-bold text-lg flex gap-3 border-slate-200 hover:bg-slate-50"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-6 h-6"
              />
              <span>Sign Up with Google</span>
            </>
          )}
        </Button>

        <div className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#0a348f] font-bold hover:underline"
          >
            Sign in Here
          </button>
        </div>
      </div>
    </div>
  );
}
