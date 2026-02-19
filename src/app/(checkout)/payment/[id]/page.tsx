"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Wallet,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";

const COURSES_DATA: any = {
  "1": { name: "Graphic Design Masterclass", price: 99, discount: 10 },
  "2": { name: "Full Stack Web Development", price: 150, discount: 15 },
  "3": { name: "AI & Machine Learning", price: 200, discount: 20 },
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // States
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    if (id && COURSES_DATA[id]) {
      setCourse(COURSES_DATA[id]);
    } else {
      setCourse({ name: "Special Course Bundle", price: 99, discount: 10 });
    }
  }, [id]);

  const calculateTotal = () => {
    if (!course) return 0;
    const discountAmount = (course.price * course.discount) / 100;
    return (course.price - discountAmount).toFixed(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Processing your transaction...");

    try {
      // Mocking API Call
      await new Promise((resolve) => setTimeout(resolve, 2500));

      toast.success("Payment Successful!", { id: loadingToast });
      router.push("/payment-success");
    } catch (error) {
      toast.error("Payment failed. Try again.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (!course)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:py-12">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Payment Options */}
        <div className="lg:col-span-8 space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0a348f] transition-colors mb-4 group"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium">Back to Course</span>
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Checkout</h1>
            <p className="text-slate-500 text-sm mb-8">
              Secure & Encrypted Payment Gateway
            </p>

            <RadioGroup
              defaultValue="card"
              onValueChange={setPaymentMethod}
              className="grid gap-4"
            >
              {/* Card Option */}
              <Label
                htmlFor="card"
                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-[#0a348f] bg-blue-50/30"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem value="card" id="card" className="sr-only" />
                  <div
                    className={`p-3 rounded-xl ${paymentMethod === "card" ? "bg-[#0a348f] text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Credit / Debit Card
                    </p>
                    <p className="text-xs text-slate-500">
                      Visa, Mastercard, SadaPay
                    </p>
                  </div>
                </div>
                {paymentMethod === "card" && (
                  <Check className="text-[#0a348f]" size={20} />
                )}
              </Label>

              {/* Wallet Option */}
              <Label
                htmlFor="wallet"
                className={`flex items-center justify-between p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === "wallet"
                    ? "border-[#0a348f] bg-blue-50/30"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem
                    value="wallet"
                    id="wallet"
                    className="sr-only"
                  />
                  <div
                    className={`p-3 rounded-xl ${paymentMethod === "wallet" ? "bg-[#0a348f] text-white" : "bg-slate-100 text-slate-500"}`}
                  >
                    <Wallet size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Mobile Wallets</p>
                    <p className="text-xs text-slate-500">
                      EasyPaisa, JazzCash
                    </p>
                  </div>
                </div>
                {paymentMethod === "wallet" && (
                  <Check className="text-[#0a348f]" size={20} />
                )}
              </Label>
            </RadioGroup>

            {/* Dynamic Forms based on selection */}
            <div className="mt-8 space-y-4">
              {paymentMethod === "card" ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400 ml-1">
                      Card Number
                    </Label>
                    <Input
                      placeholder="xxxx xxxx xxxx xxxx"
                      className="h-12 rounded-xl bg-slate-50 border-none px-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 ml-1">
                        Expiry
                      </Label>
                      <Input
                        placeholder="MM/YY"
                        className="h-12 rounded-xl bg-slate-50 border-none px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-400 ml-1">
                        CVV
                      </Label>
                      <Input
                        placeholder="123"
                        className="h-12 rounded-xl bg-slate-50 border-none px-4"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400 ml-1">
                      Account Number
                    </Label>
                    <Input
                      placeholder="03xx xxxxxxx"
                      className="h-12 rounded-xl bg-slate-50 border-none px-4"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    * You will receive a prompt on your phone to authorize.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0a348f] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
            <h2 className="text-xl font-bold mb-6">Order Details</h2>

            <div className="space-y-4 mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-blue-200 text-xs uppercase font-bold tracking-widest">
                  Selected Course
                </span>
                <span className="text-lg font-semibold leading-tight">
                  {course.name}
                </span>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-blue-100 text-sm">
                  <span>Price</span>
                  <span>${course.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-100 text-sm">
                  <span>Discount</span>
                  <span className="text-green-400">-{course.discount}%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-white/20 mb-8">
              <span className="text-lg">Total</span>
              <span className="text-4xl font-black">${calculateTotal()}</span>
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-white text-[#0a348f] hover:bg-blue-50 h-16 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : "PAY NOW"}
            </Button>

            <div className="mt-6 flex items-center justify-center gap-2 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
              <Lock size={12} />
              <span>SSL Secure Payment</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">
                Money-Back Guarantee
              </p>
              <p className="text-xs text-slate-500">
                7-day full refund policy for all courses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
