"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ExternalLink, X, Send, RefreshCw, Check } from "lucide-react";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    memberCode: string;
    fullName: string;
    mobile: string;
    whatsapp?: string;
    plan?: { name: string; fee: number };
    expiryDate?: string;
    feeStatus?: any;
  } | null;
  onReminderSent?: () => void;
}

export default function WhatsAppModal({ isOpen, onClose, member, onReminderSent }: WhatsAppModalProps) {
  const [templateType, setTemplateType] = useState<string>("FEE_DUE");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (member && isOpen) {
      const isOverdue = member.feeStatus?.category === "OVERDUE";
      const initialType = isOverdue ? "OVERDUE" : "FEE_DUE";
      setTemplateType(initialType);
      fetchRenderedMessage(initialType);
    }
  }, [member, isOpen]);

  const fetchRenderedMessage = async (type: string) => {
    if (!member) return;
    try {
      setLoading(true);
      // Construct dynamic message preview
      const res = await fetch("/api/whatsapp/templates");
      const templates = await res.json();
      const target = templates.find((t: any) => t.templateType === type);

      const fee = member.plan?.fee || 1500;
      const expiry = member.expiryDate ? new Date(member.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "today";

      let text = target?.templateBody || "Hello {member_name}, your gym membership fee of ₹{amount} is due on {due_date}. Kindly make payment.\nThank you!";
      text = text.replaceAll("{member_name}", member.fullName);
      text = text.replaceAll("{amount}", String(fee));
      text = text.replaceAll("{due_date}", expiry);
      text = text.replaceAll("{expiry_date}", expiry);
      text = text.replaceAll("{start_date}", "Today");
      text = text.replaceAll("{plan_name}", member.plan?.name || "Gym Membership");
      text = text.replaceAll("{gym_name}", "THE GYM");
      text = text.replaceAll("{gym_phone}", "+91 98765 43210");
      text = text.replaceAll("{currency}", "₹");

      setMessage(text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!member) return;
    try {
      setLoading(true);

      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: member.id,
          customMessage: message,
          templateType,
        }),
      });

      const data = await res.json();
      if (data.success && data.whatsappUrl) {
        // Open WhatsApp in a new tab with pre-filled message
        window.open(data.whatsappUrl, "_blank");
        if (onReminderSent) onReminderSent();
        onClose();
      } else {
        alert(data.error || "Failed to initiate WhatsApp");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Manual WhatsApp Reminder</h2>
              <p className="text-xs text-slate-400">Review & initiate Click-to-Chat message</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Member Card */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-white text-sm">{member.fullName}</p>
              <p className="text-xs text-slate-400">{member.memberCode} • Plan: {member.plan?.name || "Standard"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono font-semibold text-emerald-400">{member.whatsapp || member.mobile}</p>
              <p className="text-[11px] text-amber-400 font-semibold">Fee: ₹{member.plan?.fee || 1500}</p>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message Template</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "FEE_DUE", label: "Fee Due Reminder" },
                { id: "OVERDUE", label: "Overdue Alert" },
                { id: "EXPIRY_WARNING", label: "Expiry Warning" },
                { id: "WELCOME", label: "Welcome Greeting" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTemplateType(t.id);
                    fetchRenderedMessage(t.id);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition border ${
                    templateType === t.id
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-slate-800/40 text-slate-400 border-slate-700/60 hover:bg-slate-800"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Editable Preview Message */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Message Preview (Editable)</label>
              <span className="text-[10px] text-slate-500">Staff will confirm and send in WhatsApp</span>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Type or customize your WhatsApp message..."
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300/90 leading-relaxed">
            🛡️ <strong>Safety Feature:</strong> Messages are <strong>never automatically dispatched in bulk</strong>. Clicking below opens WhatsApp Web / Desktop with this prefilled message for manual staff verification.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? "Preparing..." : "Open WhatsApp & Log"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
