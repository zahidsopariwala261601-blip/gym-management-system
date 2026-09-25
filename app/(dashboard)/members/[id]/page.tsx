"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  MessageSquare,
  CreditCard,
  Calendar,
  MapPin,
  Clock,
  Shield,
  Snowflake,
  Archive,
  Printer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit,
  History
} from "lucide-react";
import WhatsAppModal from "@/components/WhatsAppModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";
import ReceiptModal from "@/components/ReceiptModal";

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [member, setMember] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const [resMember, resPlans] = await Promise.all([
        fetch(`/api/members/${id}`),
        fetch("/api/plans"),
      ]);

      if (!resMember.ok) {
        router.push("/members");
        return;
      }

      const data = await resMember.json();
      const planData = await resPlans.json();

      setMember(data);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleToggleFreeze = async () => {
    if (!member) return;
    const action = member.status === "FROZEN" ? "UNFREEZE" : "FREEZE";
    const confirm = window.confirm(`Are you sure you want to ${action.toLowerCase()} this member?`);
    if (!confirm) return;

    try {
      await fetch(`/api/members/${id}/freeze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchMember();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async () => {
    if (!member) return;
    const isArchived = !member.isArchived;
    const msg = isArchived
      ? "Archive this member? Historical fee and payment records will be preserved."
      : "Restore this member to active roster?";
    if (!window.confirm(msg)) return;

    try {
      await fetch(`/api/members/${id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived }),
      });
      fetchMember();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !member) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const { feeStatus, payments, reminders } = member;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link
          href="/members"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Member Directory</span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPaymentOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => setIsWhatsAppOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Reminder</span>
          </button>

          <button
            onClick={handleToggleFreeze}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 font-semibold text-xs border border-slate-700 transition"
          >
            <Snowflake className="w-4 h-4" />
            <span>{member.status === "FROZEN" ? "Unfreeze" : "Freeze"}</span>
          </button>

          <button
            onClick={handleArchive}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-semibold text-xs border border-slate-700 transition"
          >
            <Archive className="w-4 h-4" />
            <span>{member.isArchived ? "Unarchive" : "Archive"}</span>
          </button>
        </div>
      </div>

      {/* Member Profile Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-amber-500/20">
              {member.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{member.fullName}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    feeStatus?.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {feeStatus?.categoryLabel || member.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ID: {member.memberCode} • Joined: {new Date(member.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Active Plan</span>
              <span className="font-bold text-amber-400">{member.plan?.name || "Standard Plan"}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Valid Expiry</span>
              <span className="font-bold text-white">
                {new Date(member.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
              <span className="text-slate-400 block text-[11px]">Plan Fee</span>
              <span className="font-bold text-emerald-400">₹{member.plan?.fee?.toLocaleString() || 1500}</span>
            </div>
          </div>
        </div>

        {/* Detailed Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 block">Mobile Phone:</span>
            <span className="font-semibold text-white font-mono">{member.mobile}</span>
          </div>
          <div>
            <span className="text-slate-400 block">WhatsApp Number:</span>
            <span className="font-semibold text-emerald-400 font-mono">{member.whatsapp || member.mobile}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Email Address:</span>
            <span className="font-semibold text-slate-200">{member.email || "Not specified"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Gender / Address:</span>
            <span className="font-semibold text-slate-200">{member.gender || "Male"} • {member.address || "Local City"}</span>
          </div>
        </div>

        {member.notes && (
          <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300">
            <strong className="text-amber-400">Notes: </strong>{member.notes}
          </div>
        )}
      </div>

      {/* Lifetime Payment History Ledger */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Lifetime Payment Ledger</h3>
              <p className="text-xs text-slate-400">Permanent financial records protected under soft-delete policy</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments && payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-bold text-amber-400 font-mono">{p.receiptNo}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-slate-200">{p.plan?.name || "Membership Plan"}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">₹{p.finalAmount?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold border border-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.createdBy?.name || "System"}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No payment history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Reminder History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">WhatsApp Reminder Trail</h3>
            <p className="text-xs text-slate-400">Logs of manual click-to-chat reminders initiated for this member</p>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {reminders && reminders.length > 0 ? (
            reminders.map((r: any) => (
              <div key={r.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="text-slate-300 font-medium">"{r.messageContent}"</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Initiated by {r.initiatedBy?.name || "Staff"} to {r.mobile}
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(r.initiatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 py-4">No WhatsApp reminders have been sent yet.</p>
          )}
        </div>
      </div>

      {/* Modals */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        member={member}
        onReminderSent={fetchMember}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        member={member}
        plans={plans}
        onPaymentRecorded={fetchMember}
      />

      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={{ ...selectedReceipt, member }}
      />
    </div>
  );
}