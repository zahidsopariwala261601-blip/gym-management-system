import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const record = await prisma.backupRecord.findUnique({ where: { id } });
    if (!record) return NextResponse.json({ error: "Backup record not found" }, { status: 404 });

    const fullPath = path.join(process.cwd(), record.filePath);
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Backup file missing on disk" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const contentType = record.fileName.endsWith(".xlsx")
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/json";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${record.fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}