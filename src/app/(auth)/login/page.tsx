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
          // ✅ Token save karein
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

        // Use replace or push and then refresh
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#0a348f]">Sign in</h1>
          <p className="text-slate-500">Please Sign in with your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1 text-slate-700">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1 text-slate-700">
              Password
            </label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4 pr-12 focus-visible:ring-1 focus-visible:ring-[#0a348f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0a348f]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-xs text-slate-400 hover:text-[#0a348f] transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0a348f] hover:bg-blue-900 h-12 md:h-14 rounded-xl font-bold text-lg shadow-lg shadow-blue-50 transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "SIGN IN"}
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs uppercase tracking-widest">
            Or
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        <Button
          type="button"
          onClick={onGoogleClick}
          disabled={isLoading}
          variant="outline"
          className="w-full h-12 md:h-14 rounded-xl font-bold text-lg flex gap-3 hover:bg-slate-50 border-slate-200"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Sign In with Google</span>
        </Button>

        <p className="text-center text-sm text-slate-500 pt-2">
          Don't have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="text-[#0a348f] font-bold hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
