import { useState } from "react";
import { Step1Overview } from "./Step1Overview";
import { Step2Payment } from "./Step2Payment";
import { Step3Success } from "./Step3Success";
import { ChevronLeft } from "lucide-react";

export const EnrollmentFlow = () => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className="min-h-screen  md:py-10">
      <div className="max-w-md mx-auto  min-h-screen md:min-h-200 md:rounded-[3rem] md:shadow-2xl overflow-hidden relative flex flex-col">
        {/* Header with Progress */}
        <div className="p-6 pb-0">
          <button
            onClick={prevStep}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Progress Bar (Image 7a338c reference) */}
          <div className="mt-4 bg-blue-50 rounded-2xl p-4 flex justify-between items-center relative">
            <div className="absolute h-0.5 bg-slate-300 w-[70%] top-1/2 left-1/2 -translate-x-1/2 z-0"></div>

            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="relative z-10 flex flex-col items-center gap-1"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? "bg-[#0a348f] text-white" : "bg-slate-200 text-slate-500"}`}
                >
                  {s}
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  {s === 1 ? "Overview" : s === 2 ? "Payment" : "Success"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="grow p-6">
          {step === 1 && <Step1Overview onNext={nextStep} />}
          {step === 2 && <Step2Payment onNext={nextStep} />}
          {step === 3 && <Step3Success />}
        </div>
      </div>
    </div>
  );
};
