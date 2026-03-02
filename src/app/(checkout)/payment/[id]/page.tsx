"use client";

import { useState, useEffect, useRef } from "react";
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
  Globe,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import toast from "react-hot-toast";
import { api } from "@/services/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#1e293b",
      fontFamily: "sans-serif",
      "::placeholder": { color: "#94a3b8" },
    },
    invalid: { color: "#ef4444" },
  },
};

function CheckoutForm({
  courseId,
  amount,
  clientSecret,
  onSuccess,
}: {
  courseId: string;
  amount: number;
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedWallet, setSelectedWallet] = useState("");
  const [installmentPlan, setInstallmentPlan] = useState("3");
  const [userEmail, setUserEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PAYMENT_METHODS = [
    {
      id: "card",
      label: "Credit / Debit Card",
      sub: "Visa, Mastercard",
      icon: CreditCard,
    },
    {
      id: "wallet",
      label: "Mobile Wallet",
      sub: "EasyPaisa, JazzCash",
      icon: Smartphone,
    },
    {
      id: "installment",
      label: "Pay in Installments",
      sub: "3 or 6 months, 0% markup",
      icon: Wallet,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSendInstructions = async () => {
    if (!userEmail) {
      toast.error("Please enter your email");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter valid phone number");
      return;
    }
    setSendingEmail(true);
    try {
      await api.sendWalletInstructions({
        email: userEmail,
        method: selectedWallet,
        amount,
        phone: phoneNumber,
      });
      setEmailSent(true);
      toast.success("Instructions sent! Check your email.");
    } catch {
      toast.error("Failed to send email. Try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    const loadingToast = toast.loading("Processing payment...");
    try {
      if (paymentMethod === "card" || paymentMethod === "installment") {
        if (!stripe || !elements) return;
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");

        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: { card: cardElement },
          },
        );

        if (error) throw new Error(error.message);
        if (paymentIntent?.status === "succeeded") {
          try {
            await api.enrollInCourse(courseId);
          } catch (_) {}
          toast.success("Payment Successful!", { id: loadingToast });
          onSuccess();
        }
      } else if (paymentMethod === "wallet") {
        if (!file) {
          toast.error("Please upload payment screenshot", { id: loadingToast });
          setPaying(false);
          return;
        }
        toast.loading("Uploading receipt...", { id: loadingToast });
        const imageUrl = await api.uploadToCloudinary(file);
        toast.loading("Submitting for verification...", { id: loadingToast });
        const walletRes = await api.WalletVerify({
          courseId,
          method: selectedWallet,
          phone: "+92" + phoneNumber,
          amount,
          receiptUrl: imageUrl,
          userId: "",
        });
        if (walletRes.success) {
          toast.success("Receipt submitted! Admin will verify soon.", {
            id: loadingToast,
          });
          onSuccess();
        } else {
          throw new Error(walletRes.message || "Submission failed");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong", {
        id: loadingToast,
      });
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue="card"
        onValueChange={(val) => {
          setPaymentMethod(val);
          setEmailSent(false);
          setSelectedWallet("");
        }}
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
                <p className="font-bold text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-400">{sub}</p>
              </div>
            </div>
            {paymentMethod === id && (
              <Check className="text-[#0a348f]" size={18} />
            )}
          </Label>
        ))}
      </RadioGroup>

      {/* CARD */}
      {paymentMethod === "card" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
            Card Details
          </Label>
          <div className="h-12 px-4 flex items-center bg-slate-50 rounded-xl border border-slate-100">
            <CardElement options={CARD_ELEMENT_OPTIONS} className="w-full" />
          </div>
          <p className="text-[10px] text-slate-400 italic">
            * Powered by Stripe — 256-bit SSL encrypted
          </p>
        </div>
      )}

      {/* WALLET */}
      {paymentMethod === "wallet" && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-3">
            {["EasyPaisa", "JazzCash"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  setSelectedWallet(w);
                  setEmailSent(false);
                }}
                className={`p-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${selectedWallet === w ? "border-[#0a348f] bg-blue-50 text-[#0a348f]" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${selectedWallet === w ? "bg-[#0a348f]" : "bg-slate-300"}`}
                />
                {w}
              </button>
            ))}
          </div>

          {selectedWallet && !emailSent && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-xs font-bold text-amber-700 mb-1">
                  📧 How it works
                </p>
                <p className="text-xs text-amber-600 leading-relaxed">
                  Enter your email and phone. We will send you our{" "}
                  {selectedWallet} account details. After sending money, upload
                  the screenshot.
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Your Email
                </Label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#0a348f] outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Your {selectedWallet} Number
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium border-r pr-3 border-slate-200">
                    +92
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="3001234567"
                    maxLength={10}
                    className="w-full h-12 pl-16 pr-4 bg-slate-50 rounded-xl border border-slate-100 focus:border-[#0a348f] outline-none"
                  />
                </div>
              </div>
              <Button
                type="button"
                disabled={sendingEmail || !userEmail || phoneNumber.length < 10}
                onClick={handleSendInstructions}
                className="w-full h-12 rounded-xl bg-[#0a348f] text-white font-bold hover:bg-blue-800 transition-all"
              >
                {sendingEmail ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Sending...
                  </>
                ) : (
                  "Send Payment Instructions →"
                )}
              </Button>
            </div>
          )}

          {selectedWallet && emailSent && (
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-700">
                    Instructions sent to {userEmail}
                  </p>
                  <p className="text-xs text-green-600 mt-0.5">
                    Send PKR {amount} to our {selectedWallet} number shown in
                    the email, then upload screenshot below.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-slate-400 ml-1">
                  Upload Payment Screenshot
                </Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-35 ${preview ? "border-[#0a348f] bg-blue-50/20" : "border-slate-200 hover:border-[#0a348f] hover:bg-slate-50"}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  {preview ? (
                    <div className="relative w-full h-32 flex justify-center">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-full rounded-lg object-contain shadow-md"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <div className="mx-auto w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#0a348f] group-hover:bg-blue-50 transition-colors">
                        <ImagePlus size={20} />
                      </div>
                      <p className="text-xs font-semibold text-slate-600">
                        Click to upload slip
                      </p>
                      <p className="text-[10px] text-slate-400">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-500" />
                Admin will verify and give you access within 24 hours.
              </p>
            </div>
          )}
        </div>
      )}

      {/* INSTALLMENT */}
      {paymentMethod === "installment" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-3">
            {["3", "6"].map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setInstallmentPlan(months)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${installmentPlan === months ? "border-[#0a348f] bg-blue-50/30" : "border-slate-100"}`}
              >
                <p className="font-bold text-slate-900 text-sm">
                  {months} Months
                </p>
                <p className="text-lg font-black text-[#0a348f] mt-1">
                  PKR {Math.round(amount / parseInt(months))}
                  <span className="text-xs font-normal text-slate-400">
                    {" "}
                    /mo
                  </span>
                </p>
              </button>
            ))}
          </div>
          <div className="h-12 px-4 flex items-center bg-slate-50 rounded-xl border border-slate-100">
            <CardElement options={CARD_ELEMENT_OPTIONS} className="w-full" />
          </div>
        </div>
      )}

      {(paymentMethod !== "wallet" || emailSent) && (
        <Button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-[#0a348f] text-white hover:bg-blue-800 h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl"
        >
          {paying ? <Loader2 className="animate-spin" /> : `PAY PKR ${amount}`}
        </Button>
      )}
    </div>
  );
}

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

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [finalAmount, setFinalAmount] = useState(0);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const checkRes = (await api.checkEnrollment(id)) as any;
        const isEnrolled =
          checkRes?.isEnrolled === true || checkRes?.data?.isEnrolled === true;

        if (isEnrolled) {
          toast.error("You are already enrolled", {
            duration: 4000,
          });
          router.replace(`/course/${id}`);
          return;
        }

        const response = await api.getCourseDetails(id);
        if (response.success && response.data) {
          const data = response.data as any;
          setCourse({
            id: data._id || id,
            name: data.title || data.name,
            description: data.description || "",
            price: data.price || 0,
            discount: data.discount || 0,
            level: data.level || "Beginner",
            rating: data.rating || "4.5",
            hours: data.hours || "10",
            language: data.language || "English",
            instructor: data.instructor || "Admin",
          });

          const intentRes = (await api.createPaymentIntent(id)) as any;
          if (intentRes.success) {
            setClientSecret(intentRes.clientSecret);
            setFinalAmount(intentRes.amount);
          }
        }
      } catch (error: any) {
        toast.error("Failed to load checkout: " + error?.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) init();
  }, [id, router]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0a348f]" size={40} />
      </div>
    );

  if (!course)
    return (
      <div className="text-center py-20 font-bold text-red-500">
        Course not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 md:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Course Info Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="w-full md:w-48 h-32 bg-gradient-to-br from-[#0a348f] to-blue-400 rounded-2xl flex items-center justify-center shrink-0">
              <BookOpen size={40} className="text-white/80" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
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
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
                  <span>{course.hours} hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={14} className="text-slate-400" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0a348f] group transition-colors"
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
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    courseId={id}
                    amount={finalAmount}
                    clientSecret={clientSecret}
                    onSuccess={() => router.push("/payment-success")}
                  />
                </Elements>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="animate-spin text-[#0a348f]" size={40} />
                  <p className="text-slate-500 font-medium text-sm">
                    Initializing Secure Checkout...
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0a348f] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
              <h2 className="text-xl font-bold mb-6">Order Details</h2>
              <div className="space-y-4 mb-8">
                <div>
                  <span className="text-blue-200 text-xs uppercase font-bold tracking-widest">
                    Course
                  </span>
                  <p className="text-base font-semibold mt-1">{course.name}</p>
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
              <div className="flex justify-between items-center pt-6 border-t border-white/20">
                <span>Total</span>
                <span className="text-3xl font-black">PKR {finalAmount}</span>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-blue-300 text-[10px] font-bold uppercase tracking-widest">
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
          </div>
        </div>
      </div>
    </div>
  );
}
