import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    const plans = await prisma.plan.findMany({
      orderBy: { fee: "asc" },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await req.json();

    if (!data.name || !data.fee) {
      return NextResponse.json({ error: "Plan name and fee are required" }, { status: 400 });
    }

    const durationDays = Number(data.durationDays) || (Number(data.durationMonths) || 1) * 30;
    const durationMonths = Number(data.durationMonths) || Math.round(durationDays / 30) || 1;

    const plan = await prisma.plan.create({
      data: {
        name: data.name.trim(),
        fee: Number(data.fee),
        durationDays,
        durationMonths,
        description: data.description || null,
        status: data.status || "ACTIVE",
      },
    });

    await logActivity({
      session,
      action: "PLAN_CREATED",
      entityType: "Plan",
      entityId: plan.id,
      details: { name: plan.name, fee: plan.fee, durationDays },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
