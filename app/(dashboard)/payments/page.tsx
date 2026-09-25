"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  Filter,
  Printer,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  Plus
} from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        search,
        method: methodFilter,
        status: statusFilter,
        startDate,
        endDate,
      });

      const res = await fetch(`/api/payments?${query.toString()}`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter, startDate, endDate]);

  const totalCollected = payments.reduce((acc, p) => acc + (p.finalAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Payments & Financial Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Audit-ready permanent ledger of all gym fee receipts</p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/reports/export-excel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </a>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold">Total Filtered Revenue</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">₹{totalCollected.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500">{payments.length} receipt transaction(s)</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400 font-semibold">Payment Methods</span>
          <div className="flex gap-2 mt-2">
            {["UPI", "CASH", "CARD"].map((m) => {
              const count = payments.filter((p) => p.paymentMethod === m).length;
              return (
                <div key={m} className="px-2 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-400">{m}: </span>
                  <span className="text-white font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">Data Protection Rule</span>
            <p className="text-[11px] text-slate-300 mt-1">All payment records are permanently stored and safeguarded.</p>
          </div>
          <span className="text-2xl">🛡️</span>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPayments()}
            placeholder="Search receipt #, member, phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

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
      </div>

      {/* Payment Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Method & Ref</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading payment records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No payment records found for the selected criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.receiptNo}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/members/${p.member?.id}`}
                        className="font-bold text-white hover:text-amber-400 transition"
                      >
                        {p.member?.fullName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">{p.member?.memberCode}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.plan?.name || "Membership Plan"}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">₹{p.finalAmount?.toLocaleString()}</span>
                      {p.discount > 0 && (
                        <span className="text-[10px] text-slate-500 block">(-₹{p.discount} disc)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold border border-slate-700">
                        {p.paymentMethod}
                      </span>
                      {p.transactionId && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">{p.transactionId}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] border border-slate-700 transition"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </div>
  );
}
