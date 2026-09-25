import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { computeMemberFeeStatus } from "@/lib/feeCalculator";
import { renderWhatsAppMessage } from "@/lib/whatsapp";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const setting = await prisma.systemSetting.findFirst();
    const feeDueTemplate = await prisma.whatsAppTemplate.findUnique({
      where: { templateType: "FEE_DUE" },
    });
    const overdueTemplate = await prisma.whatsAppTemplate.findUnique({
      where: { templateType: "OVERDUE" },
    });

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

    const eligibleList = [];

    for (const m of members) {
      const feeStatus = computeMemberFeeStatus({
        status: m.status,
        isArchived: m.isArchived,
        expiryDate: m.expiryDate,
        plan: m.plan,
        payments: m.payments,
      });

      // ONLY SHOW ELIGIBLE MEMBERS WHOSE FEES ARE DUE OR OVERDUE
      if (feeStatus.isEligibleForReminder) {
        const template = feeStatus.category === "OVERDUE" ? overdueTemplate : feeDueTemplate;
        const defaultBody =
          template?.templateBody ||
          "Hello {member_name}, your gym membership fee of {currency}{amount} is due on {due_date}. Kindly make the payment. Thank you!\n{gym_name}";

        const previewMessage = renderWhatsAppMessage(defaultBody, {
          member_name: m.fullName,
          amount: m.plan?.fee || 1500,
          due_date: m.expiryDate,
          expiry_date: m.expiryDate,
          plan_name: m.plan?.name || "Gym Membership",
          gym_name: setting?.gymName || "Our Gym",
          gym_phone: setting?.gymPhone || "",
          currency: setting?.currencySymbol || "₹",
        });

        eligibleList.push({
          memberId: m.id,
          memberCode: m.memberCode,
          memberName: m.fullName,
          mobile: m.mobile,
          whatsapp: m.whatsapp || m.mobile,
          planName: m.plan?.name || "N/A",
          fee: m.plan?.fee || 1500,
          dueDate: m.expiryDate,
          category: feeStatus.category,
          categoryLabel: feeStatus.categoryLabel,
          daysOverdue: Math.abs(Math.min(0, feeStatus.daysDiff)),
          lastReminder: m.reminders[0] || null,
          previewMessage,
        });
      }
    }

    return NextResponse.json(eligibleList);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
