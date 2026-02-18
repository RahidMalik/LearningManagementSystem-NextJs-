import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const ONBOARDING_DATA = [
  {
    id: 1,
    title: "Welcome to Cybex IT Group where learning meets innovation!",
    desc: "Empowering your journey through cutting-edge IT education and expertise",
    image: "/onboarding/Isolation_Mode.png",
  },
  {
    id: 2,
    title: "Begin your learning journey and unlock a world of knowledge",
    desc: "Explore our comprehensive courses designed to transform your skills and career",
    image: "/onboarding/Layer_1.png",
  },
  {
    id: 3,
    title: "Dive into a seamless learning experience with Cybex IT Group",
    desc: "Experience interactive learning with expert-led courses and progress tracking",
    image: "/onboarding/layer4.png",
  },
  {
    id: 4,
    title: "Join a community of learners and embark on a learning adventure",
    desc: "Connect with like-minded individuals Join us to learn, grow, and thrive together!",
    image: "/onboarding/layer5.png",
  },
];
export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useRouter();

  const handleNext = () => {
    if (currentStep < ONBOARDING_DATA.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setShowAuth(true);
    }
  };

  const handleSkip = () => setShowAuth(true);

  if (showAuth) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-full  max-w-sm text-center space-y-8">
          <img
            src="/onboarding/layer6.png"
            alt="Auth"
            className=" h-48 md:h-46 w-auto mx-auto object-contain"
          />
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-tight">
              Join Cybex IT Group to Kick Start Your Lesson
            </h2>
            <p className="text-slate-500">
              Join and Learn from our Top Instructors!
            </p>
          </div>
          <div className="flex gap-4 w-full pt-10">
            <Button
              onClick={() => navigate.push("/login")}
              className="flex-1 bg-[#0a348f] hover:bg-blue-900 cursor-pointer py-7 rounded-xl font-bold text-lg"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate.push("/signup")}
              variant="outline"
              className="flex-1 border-[#0a348f] text-[#0a348f] cursor-pointer py-7 rounded-xl font-bold text-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden">
      {/* 1. Skip Button - Fixed position */}
      <div className="p-6 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-slate-400 font-bold text-sm bg-slate-100 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors"
        >
          SKIP
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm text-center space-y-6"
          >
            <img
              src={ONBOARDING_DATA[currentStep].image}
              className="w-full h-64 md:h-46 object-contain mx-auto"
              alt="Step"
            />

            <div className="space-y-3">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {ONBOARDING_DATA[currentStep].title}
              </h1>
              <p className="text-slate-500 text-sm px-4">
                {ONBOARDING_DATA[currentStep].desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-8 pb-12 flex flex-col items-center space-y-8">
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2">
          {ONBOARDING_DATA.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === i ? "w-8 bg-[#0a348f]" : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          className="min-w-20 flex items-center justify-center bg-[#0a348f] hover:bg-blue-900 text-white py-8 rounded-2xl font-bold text-md shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
};
