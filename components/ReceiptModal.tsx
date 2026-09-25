"use client";

import { Printer, X, CheckCircle, Dumbbell } from "lucide-react";
import { format } from "date-fns";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  setting?: any;
}

export default function ReceiptModal({ isOpen, onClose, payment, setting }: ReceiptModalProps) {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  const gymName = setting?.gymName || "THE GYM";
  const gymPhone = setting?.gymPhone || "+91 98765 43210";
  const gymEmail = setting?.gymEmail || "contact@gym.com";
  const gymAddress = setting?.gymAddress || "Gym Address";
  const currency = setting?.currencySymbol || "₹";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 no-print">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Payment Receipt Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 bg-slate-950 text-slate-100 printable-area font-mono text-sm space-y-6">
          {/* Gym Header */}
          <div className="text-center border-b border-dashed border-slate-700 pb-4">
            <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-lg mb-1">
              <Dumbbell className="w-5 h-5" />
              <span>{gymName}</span>
            </div>
            <p className="text-xs text-slate-400">{gymAddress}</p>
            <p className="text-xs text-slate-400">Phone: {gymPhone} | {gymEmail}</p>
          </div>

          {/* Receipt Meta */}
          <div className="grid grid-cols-2 text-xs gap-2 py-2 border-b border-slate-800">
            <div>
              <span className="text-slate-400">Receipt No: </span>
              <span className="font-bold text-amber-400">{payment.receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Date: </span>
              <span className="font-semibold text-slate-200">
                {payment.paymentDate ? format(new Date(payment.paymentDate), "dd MMM yyyy, hh:mm a") : "N/A"}
              </span>
            </div>
          </div>

          {/* Member Details */}
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Member:</span>
              <span className="font-bold text-white">{payment.member?.fullName} ({payment.member?.memberCode})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mobile:</span>
              <span className="text-slate-200">{payment.member?.mobile}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Plan:</span>
              <span className="font-semibold text-amber-400">{payment.plan?.name || "Membership Plan"}</span>
            </div>
            {payment.dueDate && (
              <div className="flex justify-between">
                <span className="text-slate-400">Valid Until:</span>
                <span className="text-emerald-400 font-semibold">{format(new Date(payment.dueDate), "dd MMM yyyy")}</span>
              </div>
            )}
          </div>

          {/* Payment Line Items */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2 text-slate-300">Membership Fee ({payment.plan?.name})</td>
                <td className="py-2 text-right text-slate-200">{currency}{payment.amount?.toLocaleString()}</td>
              </tr>
              {payment.discount > 0 && (
                <tr>
                  <td className="py-2 text-emerald-400">Discount Applied</td>
                  <td className="py-2 text-right text-emerald-400">-{currency}{payment.discount?.toLocaleString()}</td>
                </tr>
              )}
              <tr className="border-t-2 border-slate-700 font-bold text-sm">
                <td className="py-3 text-white">Net Paid Amount</td>
                <td className="py-3 text-right text-amber-400">{currency}{payment.finalAmount?.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          {/* Payment Method & Transaction */}
          <div className="text-xs space-y-1 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Mode:</span>
              <span className="font-semibold text-slate-200">{payment.paymentMethod}</span>
            </div>
            {payment.transactionId && (
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-slate-300 font-mono">{payment.transactionId}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                {payment.status}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-2 border-t border-dashed border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p>Thank you for training with us! 💪</p>
            <p className="text-[10px] text-slate-500">This is a computer-generated receipt.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
