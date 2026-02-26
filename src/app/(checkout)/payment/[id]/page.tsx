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
  Smartphone,
  Star,
  Clock,
  BookOpen,
  Eye,
  EyeOff,
  Award,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";
import axios from "axios";

// --- Course Interface for Backend & Admin Panel ---
interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  badge?: string;
  level: string;
  rating: string;
  hours: string;
  language: string;
  instructor: string;
}

const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / Debit Card",
    sub: "Visa, Mastercard, SadaPay",
    icon: CreditCard,
  },
  {
    id: "wallet",
    label: "Mobile Wallet",
    sub: "EasyPaisa, JazzCash,",
    icon: Smartphone,
  },
  {
    id: "installment",
    label: "Pay in Installments",
    sub: "3 or 6 months, 0% markup",
    icon: Wallet,
  },
];

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null); // Interface used here
  const [installmentPlan, setInstallmentPlan] = useState("3");
  const [showCVV, setShowCVV] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`/course/${id}`);
        setCourse(response.data);
      } catch (error) {
        toast.error("Course details not found");
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id]);

  const calculateTotal = () => {
    if (!course) return 0;
    const discountAmount = (course.price * (course.discount || 0)) / 100;
    return Math.round(course.price - discountAmount);
  };

  const calculateInstallment = () => {
    const total = calculateTotal();
    return Math.round(total / parseInt(installmentPlan));
  };

  const handlePayment = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Processing your transaction...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      toast.success("Payment Successful!", { id: loadingToast });
      router.push("/payment-success");
    } catch (error) {
      toast.error("Payment failed. Try again.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0a348f]" size={40} />
      </div>
    );

  if (!course)
    return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:py-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Course Info Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-full md:w-48 h-32 bg-linear-to-br from-[#0a348f] to-blue-400 rounded-2xl flex items-center justify-center shrink-0">
              <BookOpen size={40} className="text-white/80" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-widest text-[#0a348f] bg-blue-50 px-3 py-1 rounded-full">
                  {course.badge || "Premium"}
                </span>
                <span className="text-xs text-slate-400">{course.level}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                {course.name}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-slate-800">
                    {course.rating || "4.8"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{course.hours} hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400" />
                  <span>{course.language || "Urdu/English"}</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Instructed by{" "}
                <span className="text-[#0a348f] font-semibold">
                  {course.instructor}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0a348f] transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span className="text-sm font-medium">Back</span>
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Checkout
              </h1>
              <p className="text-slate-500 text-sm mb-8">
                Select your preferred payment method
              </p>

              <RadioGroup
                defaultValue="card"
                onValueChange={setPaymentMethod}
                className="grid gap-3"
              >
                {PAYMENT_METHODS.map(({ id, label, sub, icon: Icon }) => (
                  <Label
                    key={id}
                    htmlFor={id}
                    className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === id ? "border-[#0a348f] bg-blue-50/30" : "border-slate-100 hover:border-slate-200"}`}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem value={id} id={id} className="sr-only" />
                      <div
                        className={`p-2.5 rounded-xl ${paymentMethod === id ? "bg-[#0a348f] text-white" : "bg-slate-100 text-slate-500"}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {label}
                        </p>
                        <p className="text-xs text-slate-400">{sub}</p>
                      </div>
                    </div>
                    {paymentMethod === id && (
                      <Check className="text-[#0a348f]" size={18} />
                    )}
                  </Label>
                ))}
              </RadioGroup>

              <div className="mt-8 space-y-4">
                {paymentMethod === "card" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                        Visa / Mastercard Number
                      </Label>
                      <Input
                        name="cardnumber"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-number"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          let formattedValue =
                            value.match(/.{1,4}/g)?.join(" ") || "";
                          e.target.value = formattedValue.slice(0, 19);
                        }}
                        className="h-12 rounded-xl bg-slate-50 border-none px-4 font-mono tracking-widest"
                      />
                    </div>
                    <Input
                      placeholder="Cardholder Name"
                      className="h-12 rounded-xl bg-slate-50 border-none px-4"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length > 2) {
                            e.target.value =
                              value.slice(0, 2) + "/" + value.slice(2, 4);
                          } else {
                            e.target.value = value;
                          }
                        }}
                        className="h-12 rounded-xl bg-slate-50 border-none px-4"
                      />
                      <div className="relative">
                        <Input
                          type={showCVV ? "text" : "password"}
                          inputMode="numeric"
                          placeholder="CVV"
                          maxLength={3}
                          onChange={(e) => {
                            e.target.value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 3);
                          }}
                          className="h-12 rounded-xl bg-slate-50 border-none px-4 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCVV(!showCVV)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "wallet" && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Wallet Selection */}
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      {["EasyPaisa", "JazzCash"].map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWallet(w)}
                          className={`p-3 rounded-xl text-center text-sm font-semibold transition-all border-2 ${
                            selectedWallet === w
                              ? "border-[#0a348f] bg-blue-50 text-[#0a348f]"
                              : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>

                    {/* Mobile Number Input */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                        Account Mobile Number (11 Digits)
                      </Label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="03001234567"
                        maxLength={11}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          e.target.value = val.slice(0, 11);
                        }}
                        className="h-12 rounded-xl bg-slate-50 border-none px-4 font-mono tracking-widest"
                      />
                    </div>

                    {selectedWallet && (
                      <div className="p-3 bg-blue-50/50 rounded-lg flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <p className="text-[11px] text-blue-700 font-medium">
                          Payment request will be sent to your {selectedWallet}{" "}
                          app.
                        </p>
                      </div>
                    )}

                    <p className="text-[10px] text-slate-400 italic">
                      * Make sure your phone is unlocked and{" "}
                      {selectedWallet || "Wallet"} app is installed.
                    </p>
                  </div>
                )}

                {paymentMethod === "installment" && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { months: "3", label: "3 Months" },
                        { months: "6", label: "6 Months" },
                      ].map(({ months, label }) => (
                        <button
                          key={months}
                          type="button"
                          onClick={() => setInstallmentPlan(months)}
                          className={`p-4 rounded-2xl border-2 text-left transition-all ${
                            installmentPlan === months
                              ? "border-[#0a348f] bg-blue-50/30"
                              : "border-slate-100"
                          }`}
                        >
                          <p className="font-bold text-slate-900 text-sm">
                            {label}
                          </p>
                          <p className="text-lg font-black text-[#0a348f] mt-1">
                            PKR{" "}
                            {Math.round(calculateTotal() / parseInt(months))}
                            <span className="text-xs font-normal text-slate-400">
                              /mo
                            </span>
                          </p>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                          Visa / Mastercard Number
                        </Label>
                        <Input
                          name="cardnumber"
                          type="text"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            let formattedValue =
                              value.match(/.{1,4}/g)?.join(" ") || "";
                            e.target.value = formattedValue.slice(0, 19);
                          }}
                          className="h-12 rounded-xl bg-slate-50 border-none px-4 font-mono tracking-widest"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          placeholder="MM/YY"
                          maxLength={5}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, "");
                            if (value.length > 2) {
                              e.target.value =
                                value.slice(0, 2) + "/" + value.slice(2, 4);
                            } else {
                              e.target.value = value;
                            }
                          }}
                          className="h-12 rounded-xl bg-slate-50 border-none px-4"
                        />
                        <div className="relative">
                          <Input
                            type={showCVV ? "text" : "password"}
                            inputMode="numeric"
                            placeholder="CVV"
                            maxLength={3}
                            onChange={(e) => {
                              e.target.value = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 3);
                            }}
                            className="h-12 rounded-xl bg-slate-50 border-none px-4 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCVV(!showCVV)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic font-medium">
                        * Secure 256-bit encrypted transaction
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0a348f] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
              <h2 className="text-xl font-bold mb-6">Order Details</h2>
              <div className="space-y-4 mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-blue-200 text-xs uppercase font-bold tracking-widest">
                    Selected Course
                  </span>
                  <span className="text-base font-semibold leading-tight">
                    {course.name}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span>PKR {course.price}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({course.discount}%)</span>
                    <span>
                      -PKR {Math.round((course.price * course.discount) / 100)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/20 mb-8">
                <span className="text-base">Total</span>
                <span className="text-3xl font-black">
                  PKR {calculateTotal()}
                </span>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-white text-[#0a348f] hover:bg-blue-50 h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin" /> : "PAY NOW"}
              </Button>

              <div className="mt-5 flex items-center justify-center gap-2 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
                <Lock size={12} /> <span>SSL Secure Payment</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-2xl text-green-600 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Money-Back Guarantee
                </p>
                <p className="text-xs text-slate-500">
                  7-day full refund policy.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 flex items-start gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Lifetime Access
                </p>
                <p className="text-xs text-slate-500">
                  Learn at your own pace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
