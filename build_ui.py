import os

files = {}

# 1. Dashboard Page
files["app/(dashboard)/page.tsx"] = """\"use client\";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  ClockAlert,
  CreditCard,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Database,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  UserPlus,
  Send,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import BackupAlertBanner from "@/components/BackupAlertBanner";
import AddMemberModal from "@/components/AddMemberModal";
import WhatsAppModal from "@/components/WhatsAppModal";
import RecordPaymentModal from "@/components/RecordPaymentModal";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedMemberForWhatsApp, setSelectedMemberForWhatsApp] = useState<any>(null);
  const [selectedMemberForPayment, setSelectedMemberForPayment] = useState<any>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [resStats, resPlans] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/plans"),
      ]);
      const stats = await resStats.json();
      const plansList = await resPlans.json();
      setData(stats);
      setPlans(plansList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Loading Dashboard Metrics...</p>
        </div>
      </div>
    );
  }

  const { members, finances, reminders, backupStatus, recentPayments, urgentMembers } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Backup Health Banner */}
      <BackupAlertBanner backupStatus={backupStatus} isAdmin={true} />

      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time membership, fee collections & backup status</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Member</span>
          </button>

          <Link
            href="/fee-due"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
          >
            <ClockAlert className="w-4 h-4 text-amber-400" />
            <span>Fee Due Queue</span>
          </Link>

          <Link
            href="/whatsapp"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Reminders</span>
          </Link>
        </div>
      </div>

      {/* 1. Member Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Member Overview</h2>
          <Link href="/members" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            View All Members <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">Total Members</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-black text-white">{members?.total || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Active gym roster</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Active</span>
              <UserCheck className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-emerald-400">{members?.active || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Valid subscriptions</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Expiring Soon</span>
              <ClockAlert className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-400">{members?.expiringSoon || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Within next 7 days</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Expired / Overdue</span>
              <UserX className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-red-400">{members?.expired || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Renewal required</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Frozen</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-blue-400">{members?.frozen || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Temporarily paused</p>
          </div>
        </div>
      </div>

      {/* 2. Financial Statistics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Performance</h2>
          <Link href="/payments" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
            Payment History <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/20 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-semibold text-slate-300">Today's Collection</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-white">₹{finances?.todayCollection?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-emerald-400/80 mt-1">{finances?.todayTransactions || 0} transaction(s) today</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">This Week</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white">₹{finances?.weekCollection?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Current week total</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">This Month</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black text-white">₹{finances?.monthCollection?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Month to date</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-amber-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Pending Fees</span>
              <ClockAlert className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-amber-400">₹{finances?.totalPendingAmount?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Due today & overdue</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between text-red-400 mb-2">
              <span className="text-xs font-semibold text-slate-400">Overdue Amount</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <p className="text-2xl font-black text-red-400">₹{finances?.totalOverdueAmount?.toLocaleString() || 0}</p>
            <p className="text-[11px] text-slate-500 mt-1">Action required</p>
          </div>
        </div>
      </div>

      {/* 3. Operational Sections: Urgent Reminders & Backup Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Urgent Fee Due & WhatsApp Reminders */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <ClockAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Urgent Renewal & Due List</h3>
                <p className="text-xs text-slate-400">Members needing fee collection or reminders</p>
              </div>
            </div>
            <Link
              href="/whatsapp"
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              Send WhatsApp <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {urgentMembers && urgentMembers.length > 0 ? (
              urgentMembers.map((m: any) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-white">{m.fullName}</p>
                    <p className="text-[11px] text-slate-400">
                      {m.memberCode} • Plan: {m.planName} (₹{m.fee})
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        m.daysDiff < 0
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {m.daysDiff < 0 ? `Overdue ${Math.abs(m.daysDiff)}d` : "Due Today"}
                    </span>

                    <button
                      onClick={() => setSelectedMemberForPayment(m)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    >
                      Collect
                    </button>

                    <button
                      onClick={() => setSelectedMemberForWhatsApp(m)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs font-medium">
                🎉 No pending overdue fees today! All member payments are up to date.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Backup & Security Health */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white">Backup Health</h3>
            </div>
            <Link href="/backups" className="text-xs text-blue-400 hover:text-blue-300 font-semibold">
              Manage
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {/* Local Backup */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Primary Database Backup</span>
                <span className="font-semibold text-white">
                  {backupStatus?.lastBackupAt
                    ? new Date(backupStatus.lastBackupAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                    : "None created"}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                {backupStatus?.localBackupStatus || "HEALTHY"}
              </span>
            </div>

            {/* Google Drive Backup */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Google Drive Cloud Sync</span>
                <span className="font-semibold text-white">
                  {backupStatus?.gdriveStatus === "CONNECTED" ? "Synchronized" : "Setup Required"}
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                  backupStatus?.gdriveStatus === "CONNECTED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : backupStatus?.gdriveStatus === "FAILED"
                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {backupStatus?.gdriveStatus || "NOT_CONFIGURED"}
              </span>
            </div>

            {/* Excel Master */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block">Master Excel Export</span>
                <span className="font-semibold text-white">
                  {backupStatus?.lastExcelExport
                    ? new Date(backupStatus.lastExcelExport).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "Available on-demand"}
                </span>
              </div>
              <a
                href="/api/reports/export-excel"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[10px] transition"
              >
                <FileSpreadsheet className="w-3 h-3" />
                <span>Export</span>
              </a>
            </div>

            {/* Next scheduled */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Next Scheduled Backup:</span>
              <span className="font-semibold text-slate-300">{backupStatus?.nextScheduledBackup || "2:00 AM Daily"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onMemberAdded={fetchDashboard}
        plans={plans}
      />

      <WhatsAppModal
        isOpen={!!selectedMemberForWhatsApp}
        onClose={() => setSelectedMemberForWhatsApp(null)}
        member={selectedMemberForWhatsApp}
        onReminderSent={fetchDashboard}
      />

      <RecordPaymentModal
        isOpen={!!selectedMemberForPayment}
        onClose={() => setSelectedMemberForPayment(null)}
        member={selectedMemberForPayment}
        plans={plans}
        onPaymentRecorded={fetchDashboard}
      />
    </div>
  );
}
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print("Wrote:", path)
