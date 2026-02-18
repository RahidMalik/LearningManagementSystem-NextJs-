import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { toast } from "react-hot-toast";

export const ResetPassword = ({
  onNavigate,
}: {
  onNavigate: (v: string) => void;
}) => {
  // 1. Form States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. Form Handle & Validation Logic
  const handleResetPassword = async () => {
    // Basic Validation
    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    // Uppercase and Lowercase Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must contain at least one uppercase and one lowercase letter.",
      );
      return;
    }

    // 3. API Call to Database
    const loading = toast.loading("Updating password...");
    try {
      const res = await api.resetPassword(password);

      if (res.success) {
        toast.success("Password updated successfully!", { id: loading });
        onNavigate("/success"); // Success page par bhej dein
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update password. Try again.", {
        id: loading,
      });
      console.error("Reset Password Error:", error);
    }
  };

  return (
    // Full screen centering wrapper
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-xs text-slate-400 px-4">
            At least 8 characters with uppercase and lowercase letters
          </p>
        </div>

        <div className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 md:h-14 rounded-xl bg-slate-50 border-none px-4"
          />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleResetPassword}
          className="w-full bg-[#0a348f] hover:bg-blue-900 h-12 md:h-14 rounded-xl font-bold text-base md:text-lg cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-50"
        >
          DONE
        </Button>

        {/* Back to Login link */}
        <div className="text-center">
          <button
            onClick={() => onNavigate("/login")}
            className="text-sm text-slate-400 hover:text-[#0a348f] transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
