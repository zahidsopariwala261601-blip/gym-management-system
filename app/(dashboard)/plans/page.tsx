"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  DollarSign,
  X,
  Users
} from "lucide-react";

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    fee: 1500,
    durationDays: 30,
    durationMonths: 1,
    description: "",
    status: "ACTIVE",
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/plans");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      fee: 1500,
      durationDays: 30,
      durationMonths: 1,
      description: "",
      status: "ACTIVE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      fee: plan.fee,
      durationDays: plan.durationDays,
      durationMonths: plan.durationMonths,
      description: plan.description || "",
      status: plan.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : "/api/plans";
      const method = editingPlan ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPlans();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save plan");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleDeactivate = async (plan: any) => {
    if (!window.confirm(`Deactivate "${plan.name}" plan? Existing enrolled members will not be affected.`)) return;
    try {
      await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Membership Plans & Packages</h1>
          <p className="text-xs text-slate-400 mt-1">Configure duration, rates, and features for gym packages</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition relative overflow-hidden group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    p.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {p.status}
                </span>

                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Edit Plan"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {p.status === "ACTIVE" && (
                    <button
                      onClick={() => handleDeactivate(p)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400"
                      title="Deactivate Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description || "General membership package"}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Fee / Price</span>
                  <span className="text-2xl font-black text-amber-400">₹{p.fee?.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Duration</span>
                  <span className="font-bold text-white text-xs">{p.durationDays} Days ({p.durationMonths} Mo)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{p._count?.members || 0} active members</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h2 className="font-bold text-sm text-white">{editingPlan ? "Edit Membership Plan" : "Create New Plan"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Quarterly Pro"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => {
                      const days = Number(e.target.value);
                      setFormData({ ...formData, durationDays: days, durationMonths: Math.round(days / 30) || 1 });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Inclusions</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Free fitness assessment, locker access..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
