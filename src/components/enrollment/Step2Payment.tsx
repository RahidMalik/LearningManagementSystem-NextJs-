import { PlusCircle, CreditCard } from "lucide-react";

export const Step2Payment = ({ onNext }: { onNext: () => void }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-bold">Select Payment Method</h2>

      <div className="space-y-3">
        {["EasyPaisa", "Add Credit Card", "JazzCash"].map((method, i) => (
          <div
            key={method}
            className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer hover:border-[#0a348f] transition-all ${i === 1 ? "bg-blue-50 border-[#0a348f]" : "bg-slate-100 border-transparent"}`}
          >
            <div className="flex items-center gap-3 font-bold text-sm">
              {i === 1 ? (
                <PlusCircle className="text-[#0a348f]" />
              ) : (
                <PlusCircle className="text-slate-400" />
              )}
              {method}
            </div>
          </div>
        ))}
      </div>

      {/* Credit Card Mini Form */}
      <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
        <input
          placeholder="Name on Card"
          className="w-full p-3 rounded-xl bg-white border-none text-sm outline-none focus:ring-1 ring-[#0a348f]"
        />
        <input
          placeholder="Card Number"
          className="w-full p-3 rounded-xl bg-white border-none text-sm outline-none"
        />
        <div className="flex gap-3">
          <input
            placeholder="CVC"
            className="w-1/2 p-3 rounded-xl bg-white border-none text-sm outline-none"
          />
          <input
            placeholder="Expiry"
            className="w-1/2 p-3 rounded-xl bg-white border-none text-sm outline-none"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#0a348f] text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200"
      >
        Continue
      </button>
    </div>
  );
};
