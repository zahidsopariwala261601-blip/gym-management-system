"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClockAlert,
  AlertTriangle,
  Calendar,
  MessageSquare,
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2
} from "lucide-react";
import WhatsAppModal from "@/components/WhatsAppModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";

export default function FeeDuePage() {
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL_DUE");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedWhatsAppMember, setSelectedWhatsAppMember] = useState<any>(null);
  const [selectedPaymentMember, setSelectedPaymentMember] = useState<any>(null);

  const fetchFeeDue = async () => {
    try {
      setLoading(true);
      const [resDue, resPlans] = await Promise.all([
        fetch(`/api/fee-due?search=${encodeURIComponent(search)}`),
        fetch("/api/plans"),
      ]);
      const dueData = await resDue.json();
      const planData = await resPlans.json();

      setData(dueData);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeDue();
  }, []);

  const counts = data?.counts || {};
  const currentList = data?.data ? data.data[activeTab] || [] : [];

  const tabs = [
    { id: "ALL_DUE", label: "All Eligible Due", count: counts.allDue || 0, color: "text-white" },
    { id: "OVERDUE", label: "Overdue", count: counts.overdue || 0, color: "text-red-400" },
    { id: "DUE_TODAY", label: "Due Today", count: counts.dueToday || 0, color: "text-amber-400" },
    { id: "DUE_TOMORROW", label: "Due Tomorrow", count: counts.dueTomorrow || 0, color: "text-yellow-400" },
    { id: "DUE_IN_3_DAYS", label: "Due in 3 Days", count: counts.dueIn3Days || 0, color: "text-orange-400" },
    { id: "DUE_IN_7_DAYS", label: "Due in 7 Days", count: counts.dueIn7Days || 0, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Fee Due & Renewal Center</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time due queues, overdue tracking, and manual reminder dispatch</p>
        </div>

        <Link
          href="/whatsapp"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition self-start md:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Open WhatsApp Hub</span>
        </Link>
      </div>

      {/* Categorized Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 border ${
              activeTab === t.id
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === t.id ? "bg-slate-950 text-amber-400" : "bg-slate-800 text-slate-300"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchFeeDue()}
            placeholder="Search member name or phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <button
          onClick={fetchFeeDue}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Plan & Fee</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Reminder</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Calculating fee due queues...
                  </td>
                </tr>
              ) : currentList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    🎉 No members found in this category. All fees up to date!
                  </td>
                </tr>
              ) : (
                currentList.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/members/${m.id}`}
                        className="font-bold text-white hover:text-amber-400 transition"
                      >
                        {m.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">{m.memberCode}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-200">
                      {m.whatsapp || m.mobile}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">{m.plan?.name || "Standard"}</span>
                      <p className="text-emerald-400 font-bold">₹{m.plan?.fee?.toLocaleString() || 1500}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(m.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.feeStatus?.badgeColor || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {m.feeStatus?.categoryLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {m.lastReminder ? (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {new Date(m.lastReminder.initiatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Never reminded</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPaymentMember(m)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>

                        <button
                          onClick={() => setSelectedWhatsAppMember(m)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WhatsAppModal
        isOpen={!!selectedWhatsAppMember}
        onClose={() => setSelectedWhatsAppMember(null)}
        member={selectedWhatsAppMember}
        onReminderSent={fetchFeeDue}
      />

      <RecordPaymentModal
        isOpen={!!selectedPaymentMember}
        onClose={() => setSelectedPaymentMember(null)}
        member={selectedPaymentMember}
        plans={plans}
        onPaymentRecorded={fetchFeeDue}
      />
    </div>
  );
}
