"use client";

import { useState, useEffect } from "react";
import {
  Database,
  CloudUpload,
  FileSpreadsheet,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Clock,
  Lock
} from "lucide-react";

export default function BackupsPage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [setting, setSetting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Restore Modal State
  const [restoreCandidate, setRestoreCandidate] = useState<any>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/backups");
      const data = await res.json();
      setBackups(Array.isArray(data.backups) ? data.backups : []);
      setSetting(data.setting || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleTriggerBackup = async (type: "LOCAL" | "EXCEL" | "GDRIVE") => {
    try {
      setActionLoading(type);
      const res = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Backup created successfully!");
        fetchBackups();
      } else {
        alert(data.error || "Failed to create backup");
        fetchBackups();
      }
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreCandidate) return;
    try {
      setIsRestoring(true);
      const res = await fetch("/api/backups/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId: restoreCandidate.id }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("Database restored successfully! A safety snapshot of your previous data was saved automatically.");
        setRestoreCandidate(null);
        fetchBackups();
      } else {
        alert(data.error || "Restore failed");
      }
    } catch (e: any) {
      alert("Restore Error: " + e.message);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Multi-Layer Database Backup & Restore</h1>
          <p className="text-xs text-slate-400 mt-1">
            Data safety engine with automated snapshots, Google Drive cloud sync, and pre-restore protection
          </p>
        </div>

        <button
          onClick={fetchBackups}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* 4 Backup Layers Architecture Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Layer 1 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Layer 1</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white">Primary Database</h3>
          <p className="text-xs text-slate-400">PostgreSQL / SQLite with relational referential integrity.</p>
          <div className="pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active & Online</span>
          </div>
        </div>

        {/* Layer 2 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Layer 2</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="text-sm font-black text-white">Local Snapshots</h3>
          <p className="text-xs text-slate-400">Timestamped JSON & SQL database snapshots stored locally.</p>
          <button
            onClick={() => handleTriggerBackup("LOCAL")}
            disabled={actionLoading !== null}
            className="w-full mt-2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition disabled:opacity-50"
          >
            {actionLoading === "LOCAL" ? "Backing up..." : "Create Local Backup"}
          </button>
        </div>

        {/* Layer 3 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Layer 3</span>
            <CloudUpload className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-sm font-black text-white">Google Drive Cloud</h3>
          <p className="text-xs text-slate-400">Off-site cloud redundancy for catastrophic server failures.</p>
          <button
            onClick={() => handleTriggerBackup("GDRIVE")}
            disabled={actionLoading !== null}
            className="w-full mt-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition disabled:opacity-50"
          >
            {actionLoading === "GDRIVE" ? "Syncing..." : "Sync Google Drive"}
          </button>
        </div>

        {/* Layer 4 */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Layer 4</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="text-sm font-black text-white">Master Excel Export</h3>
          <p className="text-xs text-slate-400">Human-readable multi-sheet Excel (.xlsx) data backup.</p>
          <button
            onClick={() => handleTriggerBackup("EXCEL")}
            disabled={actionLoading !== null}
            className="w-full mt-2 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {actionLoading === "EXCEL" ? "Exporting..." : "Generate Excel Backup"}
          </button>
        </div>
      </div>

      {/* Backup Records History */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Available Backups Archive</h3>
              <p className="text-xs text-slate-400">Verified backup files stored securely on disk and cloud</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Backup File</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Integrity Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Loading backup history...
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    No backups created yet. Click one of the buttons above to generate your first backup.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-200">{b.fileName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-sans font-bold border border-slate-700">
                        {b.backupType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{(b.fileSize / 1024).toFixed(1)} KB</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.status === "SUCCESS"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : b.status === "WARNING"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-red-500/10 text-red-400 border-red-500/30"
                        }`}
                      >
                        {b.status === "SUCCESS" ? "Verified" : b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/backups/download/${b.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
                          title="Download Backup File"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>

                        {b.fileName.endsWith(".json") && (
                          <button
                            onClick={() => setRestoreCandidate(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition"
                            title="Restore Database from this snapshot"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Restore</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Safety Confirmation Modal */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-white">Confirm Database Restoration</h3>
                <p className="text-xs text-amber-300/80">Admin Safety Verification</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-300">
              <p>
                You are about to restore the system state from the backup file:
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-amber-400 font-bold">
                {restoreCandidate.fileName}
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automatic Safety Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-300/90">
                  Before applying this restore, the system will automatically generate a full pre-restore safety snapshot of the current database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-950 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRestoreCandidate(null)}
                disabled={isRestoring}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition disabled:opacity-50"
              >
                {isRestoring ? "Restoring Database..." : "Confirm & Restore"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
