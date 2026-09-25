"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Edit2,
  Clock,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Sliders,
  X
} from "lucide-react";
import WhatsAppModal from "@/components/WhatsAppModal";

export default function WhatsAppHubPage() {
  const [remindersList, setRemindersList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateBody, setTemplateBody] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resReminders, resTemplates] = await Promise.all([
        fetch("/api/whatsapp/reminders"),
        fetch("/api/whatsapp/templates"),
      ]);

      const remData = await resReminders.json();
      const tempData = await resTemplates.json();

      setRemindersList(Array.isArray(remData) ? remData : []);
      setTemplates(Array.isArray(tempData) ? tempData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditTemplate = (t: any) => {
    setEditingTemplate(t);
    setTemplateBody(t.templateBody);
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      const res = await fetch("/api/whatsapp/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTemplate.id,
          templateBody,
        }),
      });

      if (res.ok) {
        setEditingTemplate(null);
        fetchData();
      } else {
        alert("Failed to save template");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manual WhatsApp Reminders Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Review eligible fee-due members and trigger manual Click-to-Chat messages</p>
        </div>

        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-emerald-300">
            <strong>Anti-Spam Protocol Active:</strong> Messages are only rendered for members with due/overdue balance.
          </p>
        </div>
      </div>

      {/* Eligible Members Reminder Queue */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Eligible Fee Reminder Queue</h3>
              <p className="text-xs text-slate-400">{remindersList.length} member(s) eligible for payment reminders</p>
            </div>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Mobile / WhatsApp</th>
                <th className="py-3 px-4">Plan & Due Amount</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Last Reminded</th>
                <th className="py-3 px-4 text-right">Manual Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Fetching eligible reminder list...
                  </td>
                </tr>
              ) : remindersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    🎉 Excellent! No members are currently due or overdue for payment.
                  </td>
                </tr>
              ) : (
                remindersList.map((m: any) => (
                  <tr key={m.memberId} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <Link
                        href={`/members/${m.memberId}`}
                        className="font-bold text-white hover:text-emerald-400 transition"
                      >
                        {m.memberName}
                      </Link>
                      <p className="text-[11px] text-slate-400 font-mono">{m.memberCode}</p>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-200">
                      {m.whatsapp || m.mobile}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{m.planName}</span>
                      <p className="text-emerald-400 font-bold">₹{m.fee?.toLocaleString()}</p>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          m.category === "OVERDUE"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {m.categoryLabel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400">
                      {m.lastReminder ? (
                        <span className="text-[11px] text-emerald-400 font-medium">
                          {new Date(m.lastReminder.initiatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Not yet reminded</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() =>
                          setSelectedMember({
                            id: m.memberId,
                            memberCode: m.memberCode,
                            fullName: m.memberName,
                            mobile: m.mobile,
                            whatsapp: m.whatsapp,
                            plan: { name: m.planName, fee: m.fee },
                            expiryDate: m.dueDate,
                            feeStatus: { category: m.category },
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Templates Configuration */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Customizable WhatsApp Templates</h3>
          </div>
          <span className="text-xs text-slate-400">Supported placeholders: {`{member_name}, {amount}, {due_date}, {gym_name}, {plan_name}, {gym_phone}`}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <div key={t.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{t.title}</span>
                <button
                  onClick={() => handleOpenEditTemplate(t)}
                  className="p-1 text-slate-400 hover:text-amber-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="text-[11px] text-slate-300 font-sans whitespace-pre-wrap bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                {t.templateBody}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-sm text-white">Edit Template: {editingTemplate.title}</h3>
              <button onClick={() => setEditingTemplate(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <textarea
                rows={6}
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onReminderSent={fetchData}
      />
    </div>
  );
}
