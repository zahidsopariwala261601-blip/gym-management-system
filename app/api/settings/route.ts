import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    let setting = await prisma.systemSetting.findFirst();
    if (!setting) {
      setting = await prisma.systemSetting.create({
        data: {
          id: "default_setting",
        },
      });
    }
    return NextResponse.json(setting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await req.json();

    const updated = await prisma.systemSetting.upsert({
      where: { id: "default_setting" },
      update: {
        gymName: data.gymName,
        gymPhone: data.gymPhone,
        gymEmail: data.gymEmail,
        gymAddress: data.gymAddress,
        currencySymbol: data.currencySymbol,
        gdriveEnabled: Boolean(data.gdriveEnabled),
        gdriveFolderId: data.gdriveFolderId,
        autoBackupHour: Number(data.autoBackupHour) || 2,
        gdriveStatus: data.gdriveEnabled ? (data.gdriveFolderId ? "CONNECTED" : "FAILED") : "NOT_CONFIGURED",
      },
      create: {
        id: "default_setting",
        gymName: data.gymName || "THE GYM",
        gymPhone: data.gymPhone || "+91 98765 43210",
        gymEmail: data.gymEmail || "info@gym.com",
        gymAddress: data.gymAddress || "Gym Address",
        currencySymbol: data.currencySymbol || "₹",
        gdriveEnabled: Boolean(data.gdriveEnabled),
        gdriveFolderId: data.gdriveFolderId,
        autoBackupHour: Number(data.autoBackupHour) || 2,
      },
    });

    await logActivity({
      session,
      action: "SETTINGS_UPDATE",
      entityType: "SystemSetting",
      entityId: updated.id,
      details: data,
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
