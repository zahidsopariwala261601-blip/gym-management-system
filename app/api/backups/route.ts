import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { createLocalBackup, createExcelBackup, syncGoogleDriveBackup } from "@/lib/backupService";

export async function GET() {
  try {
    await requireAuth();
    const backups = await prisma.backupRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    const setting = await prisma.systemSetting.findFirst();
    return NextResponse.json({ backups, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { type } = await req.json(); // "LOCAL", "EXCEL", "GDRIVE"

    if (type === "EXCEL") {
      const res = await createExcelBackup(session);
      return NextResponse.json(res);
    } else if (type === "GDRIVE") {
      const res = await syncGoogleDriveBackup(session);
      return NextResponse.json(res);
    } else {
      const res = await createLocalBackup(session, "MANUAL_LOCAL");
      return NextResponse.json(res);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
