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
    const { isArchived } = await req.json();

    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const updated = await prisma.member.update({
      where: { id },
      data: {
        isArchived: Boolean(isArchived),
        archivedAt: isArchived ? new Date() : null,
        status: isArchived ? "ARCHIVED" : "ACTIVE",
      },
    });

    await logActivity({
      session,
      action: isArchived ? "MEMBER_ARCHIVED" : "MEMBER_RESTORED",
      entityType: "Member",
      entityId: id,
      details: { memberCode: member.memberCode, isArchived },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}