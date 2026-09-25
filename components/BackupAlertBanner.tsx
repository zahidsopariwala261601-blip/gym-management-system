"use client";

import { AlertTriangle, CloudOff, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BackupAlertProps {
  backupStatus?: {
    gdriveStatus?: string;
    gdriveLastError?: string | null;
    localBackupStatus?: string;
    lastBackupAt?: string | null;
  };
  isAdmin?: boolean;
}

export default function BackupAlertBanner({ backupStatus, isAdmin }: BackupAlertProps) {
  if (!backupStatus) return null;

  const isGdriveFailed = backupStatus.gdriveStatus === "FAILED";
  const needsBackup = backupStatus.localBackupStatus === "NEEDS_BACKUP" || !backupStatus.lastBackupAt;

  if (!isGdriveFailed && !needsBackup) return null;

  return (
    <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-red-950/20">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0">
          <CloudOff className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
            🔴 Backup Alert: Action Required
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {isGdriveFailed
              ? (backupStatus.gdriveLastError || "Google Drive Backup failed. Please verify settings.")
              : "No recent database backup found. Please create a fresh backup now."}
          </p>
        </div>
      </div>

      {isAdmin && (
        <Link
          href="/backups"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs transition shrink-0"
        >
          <span>Manage Backups</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
