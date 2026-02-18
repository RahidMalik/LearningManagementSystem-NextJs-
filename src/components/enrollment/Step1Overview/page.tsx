import { Star, PlayCircle, Award, Clock, Tag } from "lucide-react";

export const Step1Overview = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold">Overview</h2>
      <p className="text-lg font-medium">
        Course Name: <span className="font-bold">Graphic Design</span>
      </p>

      <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-4 rounded-3xl border border-blue-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <PlayCircle size={16} className="text-[#0a348f]" /> 80+ Lectures
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Award size={16} className="text-[#0a348f]" /> Certificate
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Clock size={16} className="text-[#0a348f]" /> 8 Weeks
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Tag size={16} className="text-[#0a348f]" /> 10% Off
        </div>
      </div>

      <div className="space-y-3 text-sm border-b pb-6">
        <div className="flex justify-between">
          <span className="text-slate-500">Course Rating:</span>
          <div className="flex text-amber-400">
            <Star size={14} fill="currentColor" />{" "}
            <Star size={14} fill="currentColor" />{" "}
            <Star size={14} fill="currentColor" />{" "}
            <Star size={14} fill="currentColor" />{" "}
            <Star size={14} fill="currentColor" />
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Course Time:</span>
          <span className="font-bold">8 Weeks</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Trainer:</span>
          <span className="font-bold text-[#0a348f]">Syed Hasnain</span>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Purchase Details
        </p>
        <div className="flex justify-between text-sm">
          <span>Date: 19/03/2024</span>
          <span>Price: 72$</span>
        </div>
        <div className="flex justify-between text-sm font-bold text-[#0a348f]">
          <span>Coupon: 10% Off</span>
          <span>Final Price: 65$</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#0a348f] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 mt-4"
      >
        Continue
      </button>
    </div>
  );
};
