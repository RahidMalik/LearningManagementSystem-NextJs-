"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wallet,
  User,
  BookOpen,
  Phone,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface PendingPayment {
  _id: string;
  user: { _id: string; name: string; email: string; fullName?: string };
  course: { _id: string; title: string; price: number };
  amount: number;
  paymentMethod: string;
  senderPhone: string;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  accessType?: "half" | "full";
  alreadyEnrolled?: boolean;
}

// ── Full-screen image lightbox ──
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-999 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
      >
        <XCircle size={28} />
      </button>
      <img
        src={src}
        alt="Payment Receipt"
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default function AdminPendingPayments() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getAdminWalletPayments();
      if (res.success) {
        // ── Mark payments where user is already fully enrolled ──
        const enriched = (res.data ?? []).map((p: PendingPayment) => ({
          ...p,
          alreadyEnrolled: false, // will be set per-approve check on server
        }));
        setPayments(enriched);
      }
    } catch {
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleApprove = async (paymentId: string) => {
    setActionId(paymentId);
    try {
      const res = (await api.approveWalletPayment(paymentId)) as any;
      if (res.success) {
        if (res.alreadyEnrolled) {
          toast("User already fully enrolled — no change made.", {
            icon: "⚠️",
          });
          setPayments((prev) =>
            prev.map((p) =>
              p._id === paymentId ? { ...p, alreadyEnrolled: true } : p,
            ),
          );
        } else {
          toast.success("Payment approved! User access granted");
          setPayments((prev) =>
            prev.map((p) =>
              p._id === paymentId ? { ...p, status: "approved" } : p,
            ),
          );
        }
      } else throw new Error(res.error || "Failed");
    } catch (e: any) {
      toast.error(e.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    setActionId(paymentId);
    try {
      const res = await api.rejectWalletPayment(paymentId);
      if (res.success) {
        toast.success("Payment rejected");
        setPayments((prev) =>
          prev.map((p) =>
            p._id === paymentId ? { ...p, status: "rejected" } : p,
          ),
        );
      } else throw new Error(res.error || "Failed");
    } catch (e: any) {
      toast.error(e.message || "Rejection failed");
    } finally {
      setActionId(null);
    }
  };

  const filtered = payments.filter((p) => p.status === tab);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <ImageLightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#0a348f] dark:text-blue-400" />
              <h2 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">
                Wallet Payments
              </h2>
            </div>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-black bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full animate-pulse">
                {pendingCount} PENDING
              </span>
            )}
          </div>
          <button
            onClick={fetchPayments}
            className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-500 hover:text-[#0a348f] dark:hover:text-blue-400 transition-colors font-medium"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-zinc-800/60 rounded-2xl w-fit">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                tab === t
                  ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-700"
              }`}
            >
              {t}
              <span
                className={`ml-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                  t === "pending"
                    ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : t === "approved"
                      ? "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
                      : "bg-red-100 dark:bg-red-500/20 text-red-500 dark:text-red-400"
                }`}
              >
                {payments.filter((p) => p.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <RefreshCw size={20} className="animate-spin text-[#0a348f]" />
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              Loading payments...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
              <Wallet size={20} className="text-slate-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-zinc-400">
              No {tab} payments
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((payment) => {
              // ── Try all possible name fields ──
              const userName =
                payment.user?.name ||
                (payment.user as any)?.fullName ||
                (payment.user as any)?.username ||
                payment.user?.email?.split("@")[0] ||
                "Unknown User";

              return (
                <div
                  key={payment._id}
                  className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 hover:border-slate-200 dark:hover:border-zinc-700 transition-colors"
                >
                  {/* Already enrolled warning */}
                  {payment.alreadyEnrolled && (
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
                      <AlertTriangle
                        size={13}
                        className="text-amber-500 shrink-0"
                      />
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Already fully enrolled — no action taken
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* ── Receipt Image ── */}
                    <button
                      onClick={() =>
                        payment.receiptUrl && setLightbox(payment.receiptUrl)
                      }
                      className="shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-zinc-700 hover:border-[#0a348f] dark:hover:border-blue-400 transition-colors relative group bg-slate-100 dark:bg-zinc-800"
                      title="Click to view full size"
                    >
                      {payment.receiptUrl ? (
                        <>
                          <img
                            src={payment.receiptUrl}
                            alt="Receipt"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">
                              VIEW
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen
                            size={20}
                            className="text-slate-300 dark:text-zinc-600"
                          />
                        </div>
                      )}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          {/* Method + access badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                payment.paymentMethod
                                  ?.toLowerCase()
                                  .includes("easy")
                                  ? "bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400"
                                  : "bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400"
                              }`}
                            >
                              {payment.paymentMethod || "Wallet"}
                            </span>
                            {payment.accessType && (
                              <span
                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                  payment.accessType === "half"
                                    ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                    : "bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400"
                                }`}
                              >
                                {payment.accessType} access
                              </span>
                            )}
                          </div>

                          {/* Amount */}
                          <p className="text-base font-black text-slate-800 dark:text-white">
                            PKR {payment.amount?.toLocaleString()}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0 whitespace-nowrap">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-PK",
                            {
                              day: "numeric",
                              month: "short",
                            },
                          )}{" "}
                          {new Date(payment.createdAt).toLocaleTimeString(
                            "en-PK",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>

                      {/* User + Course + Phone */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-zinc-300 font-semibold">
                          <User size={11} className="text-slate-400" />
                          <span>{userName}</span>
                          {payment.user?.email && (
                            <span className="text-slate-400 font-normal">
                              · {payment.user.email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                          <BookOpen size={11} />
                          <span className="truncate">
                            {payment.course?.title || "Unknown Course"}
                          </span>
                        </div>
                        {payment.senderPhone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
                            <Phone size={11} />
                            <span>{payment.senderPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {payment.status === "pending" && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => handleApprove(payment._id)}
                        disabled={actionId === payment._id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-60"
                      >
                        {actionId === payment._id ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        Approve & Grant Access
                      </button>
                      <button
                        onClick={() => handleReject(payment._id)}
                        disabled={actionId === payment._id}
                        className="px-5 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  )}

                  {/* Status badge */}
                  {payment.status !== "pending" && (
                    <div
                      className={`mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-1.5 text-xs font-bold ${
                        payment.status === "approved"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {payment.status === "approved" ? (
                        <>
                          <CheckCircle2 size={13} /> Access Granted
                        </>
                      ) : (
                        <>
                          <XCircle size={13} /> Rejected
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
