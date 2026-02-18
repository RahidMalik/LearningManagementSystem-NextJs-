"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { handleGoogleAuth } from "@/utils/GoogleAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

// 1. Isay "export default function" bana diya
export default function SignUpPage() {
  const router = useRouter();

  // States
  const [fullName, setFullname] = useState<string>("");
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [ConfirmPassword, setConfirmPassword] = useState<string>("");

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
    if (!validateForm()) return;

    const loading = toast.loading("Creating account...");
    try {
      const res = await api.register(fullName, Email, Password);
      if (res.success) {
        toast.success("Registration successful!", { id: loading });
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Sign up failed", { id: loading });
    }
  };

  // Google Sign Up
  const onGoogleClick = async () => {
    try {
      const { user } = await handleGoogleAuth();
      if (user) {
        const loading = toast.loading("Connecting Google...");
        const res = await api.googleLogin({
          email: user.email,
          name: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
        });
        if (res.success) {
          toast.success("Welcome!", { id: loading });
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error("Google login failed.");
      console.error(error);
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
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />
          <Input
            type="email"
            placeholder="Email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />
          <Input
            type="password"
            placeholder="Password"
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={ConfirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-14 rounded-xl border-none bg-slate-50 px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
          />

          <Button
            type="submit"
            className="w-full h-12 md:h-14 bg-[#0a348f] hover:bg-[#0d275f] rounded-xl font-bold text-lg mt-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-100"
          >
            Sign Up
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
          variant="outline"
          className="w-full h-12 md:h-14 rounded-xl font-bold text-lg flex gap-3 cursor-pointer hover:bg-slate-50 border-slate-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          <span>Sign Up with Google</span>
        </Button>

        <div className="text-center text-sm text-slate-500 pt-2">
          Already have an account?{" "}
          {/* onNavigate ki jagah seedha router.push use kiya */}
          <button
            onClick={() => router.push("/login")}
            className="text-[#0a348f] font-bold hover:underline cursor-pointer"
          >
            Sign in Here
          </button>
        </div>
      </div>
    </div>
  );
}
