import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { restoreFromBackup } from "@/lib/backupService";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { backupId } = await req.json();

    if (!backupId) {
      return NextResponse.json({ error: "Backup ID is required" }, { status: 400 });
    }

    const result = await restoreFromBackup(backupId, session);
    return NextResponse.json({
      success: true,
      message: "Database restored successfully. Pre-restore safety snapshot created.",
      safetySnapshot: result.safetySnapshot,
    });
  } catch (error: any) {
    console.error("Restore error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
