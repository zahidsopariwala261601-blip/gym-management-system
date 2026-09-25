import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { action } = await req.json();

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const newStatus = action === "FREEZE" ? "FROZEN" : "ACTIVE";

    const updated = await prisma.member.update({
      where: { id },
      data: { status: newStatus },
    });

    await logActivity({
      session,
      action: action === "FREEZE" ? "MEMBER_FROZEN" : "MEMBER_UNFROZEN",
      entityType: "Member",
      entityId: id,
      details: { memberCode: member.memberCode, status: newStatus },
    });

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}