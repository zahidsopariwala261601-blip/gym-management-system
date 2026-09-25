import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dayStart = startOfDay(now);
    const dayEnd = endOfDay(now);
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // 1. Member Stats
    const totalMembers = await prisma.member.count({ where: { isArchived: false } });
    const archivedMembers = await prisma.member.count({ where: { isArchived: true } });
    const frozenMembers = await prisma.member.count({ where: { status: "FROZEN", isArchived: false } });

    // Load active/expiring/expired based on expiryDate
    const allActiveMembers = await prisma.member.findMany({
      where: { isArchived: false, status: { not: "FROZEN" } },
      include: { plan: true },
    });

    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let dueTodayCount = 0;
    let overdueCount = 0;
    let totalPendingAmount = 0;
    let totalOverdueAmount = 0;

    for (const m of allActiveMembers) {
      const days = differenceInCalendarDays(startOfDay(new Date(m.expiryDate)), dayStart);
      const fee = m.plan?.fee || 1500;

      if (days < 0) {
        expiredCount++;
        overdueCount++;
        totalOverdueAmount += fee;
        totalPendingAmount += fee;
      } else if (days === 0) {
        dueTodayCount++;
        expiringSoonCount++;
        totalPendingAmount += fee;
      } else if (days <= 7) {
        expiringSoonCount++;
      } else {
        activeCount++;
      }
    }

    // 2. Financial Collections
    const todayPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: { gte: dayStart, lte: dayEnd },
        status: "PAID",
      },
      _sum: { finalAmount: true },
      _count: true,
    });

    const weekPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: { gte: weekStart, lte: weekEnd },
        status: "PAID",
      },
      _sum: { finalAmount: true },
    });

    const monthPayments = await prisma.payment.aggregate({
      where: {
        paymentDate: { gte: monthStart, lte: monthEnd },
        status: "PAID",
      },
      _sum: { finalAmount: true },
    });

    // 3. WhatsApp Reminder Stats
    const remindersSentToday = await prisma.whatsAppReminderLog.count({
      where: {
        initiatedAt: { gte: dayStart, lte: dayEnd },
      },
    });

    const totalEligibleForReminder = dueTodayCount + overdueCount;
    const remindersPending = Math.max(0, totalEligibleForReminder - remindersSentToday);

    // 4. Backup Health Status
    const lastBackup = await prisma.backupRecord.findFirst({
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    const lastExcelBackup = await prisma.backupRecord.findFirst({
      where: { backupType: "EXCEL", status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });

    const setting = await prisma.systemSetting.findFirst();

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
      take: 5,
      orderBy: { paymentDate: "desc" },
      include: { member: true, plan: true },
    });

    // Urgent fee due members
    const urgentMembers = allActiveMembers
      .filter((m) => differenceInCalendarDays(startOfDay(new Date(m.expiryDate)), dayStart) <= 0)
      .slice(0, 6)
      .map((m) => ({
        id: m.id,
        memberCode: m.memberCode,
        fullName: m.fullName,
        mobile: m.mobile,
        whatsapp: m.whatsapp,
        planName: m.plan?.name || "N/A",
        fee: m.plan?.fee || 1500,
        expiryDate: m.expiryDate,
        daysDiff: differenceInCalendarDays(startOfDay(new Date(m.expiryDate)), dayStart),
      }));

    return NextResponse.json({
      members: {
        total: totalMembers,
        active: activeCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        frozen: frozenMembers,
        archived: archivedMembers,
      },
      finances: {
        todayCollection: todayPayments._sum.finalAmount || 0,
        todayTransactions: todayPayments._count || 0,
        weekCollection: weekPayments._sum.finalAmount || 0,
        monthCollection: monthPayments._sum.finalAmount || 0,
        totalPendingAmount,
        totalOverdueAmount,
      },
      reminders: {
        dueToday: dueTodayCount,
        overdue: overdueCount,
        remindersSentToday,
        remindersPending,
      },
      backupStatus: {
        lastBackupAt: lastBackup?.createdAt || null,
        lastBackupFile: lastBackup?.fileName || "None",
        gdriveStatus: setting?.gdriveStatus || "NOT_CONFIGURED",
        gdriveLastError: setting?.gdriveLastError || null,
        localBackupStatus: lastBackup ? "HEALTHY" : "NEEDS_BACKUP",
        lastExcelExport: lastExcelBackup?.createdAt || null,
        nextScheduledBackup: setting?.autoBackupHour ? `${setting.autoBackupHour}:00 AM Daily` : "2:00 AM Daily",
      },
      recentPayments,
      urgentMembers,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
