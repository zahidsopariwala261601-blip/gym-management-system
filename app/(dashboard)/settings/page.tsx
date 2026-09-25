"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Building,
  Cloud,
  Users,
  Shield,
  Save,
  Plus,
  Edit2,
  CheckCircle2,
  Lock,
  X,
  AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const [setting, setSetting] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // User modal form
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSetting, resUsers] = await Promise.all([
        fetch("/api/settings"),
        fetch("/api/users"),
      ]);

      const sData = await resSetting.json();
      const uData = await resUsers.json();

      setSetting(sData);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setting),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save settings");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });

      if (res.ok) {
        setIsUserModalOpen(false);
        setUserForm({ name: "", email: "", password: "", role: "STAFF" });
        fetchData();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to create user account");
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  if (loading || !setting) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System & Gym Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage gym branding, cloud backup credentials, and staff access</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* 1. Gym Profile */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Gym Profile & Receipt Branding</h2>
              <p className="text-xs text-slate-400">Details printed on receipts and WhatsApp reminders</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gym Name</label>
              <input
                type="text"
                value={setting.gymName || ""}
                onChange={(e) => setSetting({ ...setting, gymName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone</label>
              <input
                type="text"
                value={setting.gymPhone || ""}
                onChange={(e) => setSetting({ ...setting, gymPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={setting.gymEmail || ""}
                onChange={(e) => setSetting({ ...setting, gymEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={setting.currencySymbol || "₹"}
                onChange={(e) => setSetting({ ...setting, currencySymbol: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gym Address</label>
              <input
                type="text"
                value={setting.gymAddress || ""}
                onChange={(e) => setSetting({ ...setting, gymAddress: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* 2. Google Drive Cloud Backup Config */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">Google Drive Cloud Redundancy</h2>
                <p className="text-xs text-slate-400">Automated remote daily backup synchronization</p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={setting.gdriveEnabled || false}
                onChange={(e) => setSetting({ ...setting, gdriveEnabled: e.target.checked })}
                className="rounded bg-slate-950 border-slate-700 text-purple-500 focus:ring-0 w-4 h-4"
              />
              <span>Enable Cloud Sync</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Google Drive Folder ID</label>
              <input
                type="text"
                value={setting.gdriveFolderId || ""}
                onChange={(e) => setSetting({ ...setting, gdriveFolderId: e.target.value })}
                placeholder="e.g. 1A2b3C4d5E_GymBackups"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Automated Backup Hour</label>
              <select
                value={setting.autoBackupHour || 2}
                onChange={(e) => setSetting({ ...setting, autoBackupHour: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value={1}>1:00 AM Daily</option>
                <option value={2}>2:00 AM Daily (Recommended)</option>
                <option value={3}>3:00 AM Daily</option>
                <option value={23}>11:00 PM Daily</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saveLoading ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>

      {/* 3. User & Staff Management */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Staff & Administrator Accounts</h2>
              <p className="text-xs text-slate-400">Role-based access control (Admin & Receptionist)</p>
            </div>
          </div>

          <button
            onClick={() => setIsUserModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        u.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-semibold text-[11px]">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="font-bold text-sm text-white">Create Staff Account</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="e.g. Front Desk Staff"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. staff2@gym.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="STAFF">STAFF (Receptionist)</option>
                  <option value="ADMIN">ADMIN (Full Control)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
