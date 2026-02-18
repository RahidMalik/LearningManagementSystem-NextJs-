import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { handleGoogleAuth } from "@/utils/GoogleAuth";
import { toast } from "react-hot-toast";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";

export const Login = ({ onNavigate }: { onNavigate: (v: any) => void }) => {
  const navigateToLogin = useNavigate();
  const [Email, setEmail] = useState<string>("");
  const [Password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

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

  const onGoogleClick = async () => {
    try {
      const { user } = await handleGoogleAuth();
      if (user) {
        const loading = toast.loading("Signing in with Google...");
        const res = await api.googleLogin({
          email: user.email,
          name: user.displayName,
          uid: user.uid,
          photoURL: user.photoURL,
        });
        if (res.success) {
          toast.success("Welcome back!", { id: loading });
          navigateToLogin("/dashboard");
        }
      }
    } catch (error) {
      toast.error("Google login failed.");
      console.error(error);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const loading = toast.loading("Checking credentials...");
    try {
      const res = await api.login(Email, Password);
      if (res.success) {
        toast.success("Login Successful", { id: loading });
        navigateToLogin("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials", { id: loading });
    }
  };

  return (
    // 1. Full Screen Centering Logic
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-sans">Sign in</h1>
          <p className="text-slate-500">Please Sign in with your account</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Email Here</label>
            <Input
              type="email"
              placeholder="Your Email Here"
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Password</label>
            <div className="relative group">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              <button
                type="button"
                onClick={() => onNavigate("/reset")}
                className="absolute right-0 -bottom-6 text-xs text-slate-400 hover:text-[#0a348f] transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* 2. Responsive Sign In Button */}
          <Button
            type="submit"
            className="w-full bg-[#0a348f] hover:bg-blue-900 h-12 md:h-14 rounded-xl mt-4 font-bold text-base md:text-lg shadow-lg shadow-blue-100 cursor-pointer active:scale-95 transition-all"
          >
            SIGN IN
          </Button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-slate-400 text-xs uppercase">
            Or
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* 3. Responsive Google Button */}
        <Button
          type="button"
          onClick={onGoogleClick}
          variant="outline"
          className="w-full h-12 md:h-14 rounded-xl font-bold text-base md:text-lg flex gap-3 cursor-pointer hover:bg-slate-50"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5 md:w-6 md:h-6"
          />
          <span>Sign In with Google</span>
        </Button>

        <div className="text-center text-sm text-slate-500 pt-4">
          Didn't have an account?{" "}
          <button
            onClick={() => onNavigate("/signup")}
            className="text-[#0a348f] font-bold hover:underline cursor-pointer"
          >
            Sign up Here
          </button>
        </div>
      </div>
    </div>
  );
};
