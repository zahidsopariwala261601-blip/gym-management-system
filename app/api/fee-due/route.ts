import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { computeMemberFeeStatus } from "@/lib/feeCalculator";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || "";

    const members = await prisma.member.findMany({
      where: {
        isArchived: false,
        status: { not: "FROZEN" },
      },
      include: {
        plan: true,
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 1,
        },
        reminders: {
          orderBy: { initiatedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { expiryDate: "asc" },
    });

    const categorized = {
      DUE_TODAY: [] as any[],
      DUE_TOMORROW: [] as any[],
      DUE_IN_3_DAYS: [] as any[],
      DUE_IN_7_DAYS: [] as any[],
      OVERDUE: [] as any[],
      EXPIRING_SOON: [] as any[],
      ACTIVE: [] as any[],
      ALL_DUE: [] as any[],
    };

    for (const m of members) {
      const feeStatus = computeMemberFeeStatus({
        status: m.status,
        isArchived: m.isArchived,
        expiryDate: m.expiryDate,
        plan: m.plan,
        payments: m.payments,
      });

      const memberItem = {
        ...m,
        feeStatus,
        lastReminder: m.reminders[0] || null,
      };

      if (search) {
        const query = search.toLowerCase();
        const match =
          m.fullName.toLowerCase().includes(query) ||
          m.memberCode.toLowerCase().includes(query) ||
          m.mobile.includes(query);
        if (!match) continue;
      }

      if (feeStatus.category === "DUE_TODAY") categorized.DUE_TODAY.push(memberItem);
      if (feeStatus.category === "DUE_TOMORROW") categorized.DUE_TOMORROW.push(memberItem);
      if (feeStatus.category === "DUE_IN_3_DAYS") categorized.DUE_IN_3_DAYS.push(memberItem);
      if (feeStatus.category === "DUE_IN_7_DAYS") categorized.DUE_IN_7_DAYS.push(memberItem);
      if (feeStatus.category === "OVERDUE") categorized.OVERDUE.push(memberItem);
      if (feeStatus.category === "EXPIRING_SOON") categorized.EXPIRING_SOON.push(memberItem);
      if (feeStatus.category === "ACTIVE") categorized.ACTIVE.push(memberItem);

      if (feeStatus.isEligibleForReminder) {
        categorized.ALL_DUE.push(memberItem);
      }
    }

    return NextResponse.json({
      counts: {
        dueToday: categorized.DUE_TODAY.length,
        dueTomorrow: categorized.DUE_TOMORROW.length,
        dueIn3Days: categorized.DUE_IN_3_DAYS.length,
        dueIn7Days: categorized.DUE_IN_7_DAYS.length,
        overdue: categorized.OVERDUE.length,
        allDue: categorized.ALL_DUE.length,
      },
      data: categorized,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
