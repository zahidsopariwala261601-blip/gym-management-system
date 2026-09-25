import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const data = await req.json();

    const plan = await prisma.plan.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        fee: data.fee !== undefined ? Number(data.fee) : undefined,
        durationDays: data.durationDays !== undefined ? Number(data.durationDays) : undefined,
        durationMonths: data.durationMonths !== undefined ? Number(data.durationMonths) : undefined,
        description: data.description !== undefined ? data.description : undefined,
        status: data.status,
      },
    });

    await logActivity({
      session,
      action: "PLAN_UPDATED",
      entityType: "Plan",
      entityId: id,
      details: data,
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    // Archive plan rather than hard delete if members exist
    const plan = await prisma.plan.update({
      where: { id },
      data: { status: "INACTIVE" },
    });

    await logActivity({
      session,
      action: "PLAN_ARCHIVED",
      entityType: "Plan",
      entityId: id,
      details: { name: plan.name },
    });

    return NextResponse.json({ success: true, message: "Plan deactivated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}