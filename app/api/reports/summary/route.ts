import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const method = searchParams.get("method");

    const paymentWhere: any = { status: "PAID" };
    if (startDate || endDate) {
      paymentWhere.paymentDate = {};
      if (startDate) paymentWhere.paymentDate.gte = startOfDay(new Date(startDate));
      if (endDate) paymentWhere.paymentDate.lte = endOfDay(new Date(endDate));
    }
    if (method && method !== "ALL") {
      paymentWhere.paymentMethod = method;
    }

    const payments = await prisma.payment.findMany({
      where: paymentWhere,
      include: {
        member: { select: { fullName: true, memberCode: true, mobile: true } },
        plan: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    const totalCollected = payments.reduce((sum, p) => sum + p.finalAmount, 0);
    const totalDiscounts = payments.reduce((sum, p) => sum + p.discount, 0);

    // Group by method
    const methodBreakdown: Record<string, { count: number; total: number }> = {};
    for (const p of payments) {
      if (!methodBreakdown[p.paymentMethod]) {
        methodBreakdown[p.paymentMethod] = { count: 0, total: 0 };
      }
      methodBreakdown[p.paymentMethod].count++;
      methodBreakdown[p.paymentMethod].total += p.finalAmount;
    }

    // Reminders summary
    const reminders = await prisma.whatsAppReminderLog.findMany({
      take: 100,
      orderBy: { initiatedAt: "desc" },
      include: {
        member: { select: { fullName: true, memberCode: true } },
        initiatedBy: { select: { name: true } },
      },
    });

    return NextResponse.json({
      payments,
      stats: {
        totalCollected,
        totalDiscounts,
        transactionCount: payments.length,
        methodBreakdown,
      },
      reminders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
