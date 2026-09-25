"use client";

import { useState, useEffect } from "react";
import {
  FileBarChart,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        method: methodFilter,
        startDate,
        endDate,
      });

      const res = await fetch(`/api/reports/summary?${query.toString()}`);
      const summary = await res.json();
      setData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [methodFilter, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const { payments, stats, reminders } = data || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Financial & Member Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Generate collection statements, audit sheets, and export reports</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <a
            href="/api/reports/export-excel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap text-xs">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            title="Start Date"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            title="End Date"
          />
        </div>

        <button
          onClick={fetchReports}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold">Total Revenue Collected</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{stats?.totalCollected?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-slate-500">{stats?.transactionCount || 0} receipts</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold">Total Discounts Given</span>
          <p className="text-2xl font-black text-amber-400 mt-1">₹{stats?.totalDiscounts?.toLocaleString() || 0}</p>
          <p className="text-[11px] text-slate-500">Promotions applied</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl col-span-2">
          <span className="text-xs text-slate-400 font-semibold">Method Breakdown</span>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {stats?.methodBreakdown &&
              Object.entries(stats.methodBreakdown).map(([method, val]: any) => (
                <div key={method} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px]">{method}</span>
                  <span className="font-bold text-white">₹{val.total?.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">({val.count} txns)</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Printable Report Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden p-6 printable-area space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-base text-white">Fee Collections Ledger</h2>
            <p className="text-xs text-slate-400">Showing {payments?.length || 0} recorded transactions</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Report generated: {new Date().toLocaleDateString("en-IN")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Receipt #</th>
                <th className="py-2.5 px-3">Member</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Discount</th>
                <th className="py-2.5 px-3">Net Paid</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {payments && payments.length > 0 ? (
                payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-amber-400">{p.receiptNo}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-white">{p.member?.fullName} ({p.member?.memberCode})</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{p.plan?.name || "Membership"}</td>
                    <td className="py-2.5 px-3 text-slate-400">₹{p.amount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-slate-400">₹{p.discount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">₹{p.finalAmount?.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{p.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-slate-400">{new Date(p.paymentDate).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No transactions match the selected date range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
