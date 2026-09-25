"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Phone,
  MessageSquare,
  CreditCard,
  Eye,
  Archive,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Calendar,
  DollarSign
} from "lucide-react";
import AddMemberModal from "@/components/AddMemberModal";
import WhatsAppModal from "@/components/WhatsAppModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [showArchived, setShowArchived] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedWhatsAppMember, setSelectedWhatsAppMember] = useState<any>(null);
  const [selectedPaymentMember, setSelectedPaymentMember] = useState<any>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        planId: planFilter,
        archived: showArchived ? "true" : "false",
      });

      const [resMembers, resPlans] = await Promise.all([
        fetch(`/api/members?${query.toString()}`),
        fetch("/api/plans"),
      ]);

      const data = await resMembers.json();
      const planData = await resPlans.json();

      setMembers(Array.isArray(data) ? data : []);
      setPlans(Array.isArray(planData) ? planData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter, planFilter, showArchived]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Members Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active, expiring, expired, and archived gym members</p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Member</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, code..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired / Overdue</option>
            <option value="FROZEN">Frozen</option>
          </select>

          {/* Plan filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Plans</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Archived Toggle */}
          <button
            type="button"
            onClick={() => setShowArchived(!showArchived)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              showArchived
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-slate-950 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {showArchived ? "Showing Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Plan & Validity</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No members match the current search or filters.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const feeStatus = m.feeStatus;
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/40 transition">
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <Link
                              href={`/members/${m.id}`}
                              className="font-bold text-white hover:text-amber-400 transition"
                            >
                              {m.fullName}
                            </Link>
                            <p className="text-[11px] text-slate-400 font-mono">{m.memberCode}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-200 font-mono">{m.mobile}</p>
                          {m.email && <p className="text-[11px] text-slate-400">{m.email}</p>}
                        </div>
                      </td>

                      {/* Plan & Validity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-200">{m.plan?.name || "Standard"}</p>
                          <p className="text-[11px] text-slate-400">
                            Expires: {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Fee Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            feeStatus?.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {feeStatus?.categoryLabel || m.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/members/${m.id}`}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => setSelectedPaymentMember(m)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {feeStatus?.isEligibleForReminder && (
                            <button
                              onClick={() => setSelectedWhatsAppMember(m)}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                              title="Send WhatsApp Reminder"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onMemberAdded={fetchMembers}
        plans={plans}
      />

      <WhatsAppModal
        isOpen={!!selectedWhatsAppMember}
        onClose={() => setSelectedWhatsAppMember(null)}
        member={selectedWhatsAppMember}
        onReminderSent={fetchMembers}
      />

      <RecordPaymentModal
        isOpen={!!selectedPaymentMember}
        onClose={() => setSelectedPaymentMember(null)}
        member={selectedPaymentMember}
        plans={plans}
        onPaymentRecorded={fetchMembers}
      />
    </div>
  );
}
