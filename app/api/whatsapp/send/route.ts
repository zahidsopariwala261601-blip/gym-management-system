import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { generateWhatsAppUrl, renderWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { memberId, customMessage, templateType } = await req.json();

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { plan: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const setting = await prisma.systemSetting.findFirst();

    let messageToSend = customMessage;
    if (!messageToSend) {
      const template = await prisma.whatsAppTemplate.findUnique({
        where: { templateType: templateType || "FEE_DUE" },
      });
      const templateBody =
        template?.templateBody ||
        "Hello {member_name}, your gym fee of {currency}{amount} is due on {due_date}. Thank you!\n{gym_name}";

      messageToSend = renderWhatsAppMessage(templateBody, {
        member_name: member.fullName,
        amount: member.plan?.fee || 1500,
        due_date: member.expiryDate,
        expiry_date: member.expiryDate,
        plan_name: member.plan?.name || "Plan",
        gym_name: setting?.gymName || "Our Gym",
        gym_phone: setting?.gymPhone || "",
        currency: setting?.currencySymbol || "₹",
      });
    }

    const targetNumber = member.whatsapp || member.mobile;
    const whatsappUrl = generateWhatsAppUrl(targetNumber, messageToSend);

    // Record that WhatsApp reminder was manually initiated
    const log = await prisma.whatsAppReminderLog.create({
      data: {
        memberId: member.id,
        mobile: targetNumber,
        messageContent: messageToSend,
        initiatedById: session.userId,
        status: "INITIATED",
      },
    });

    await logActivity({
      session,
      action: "WHATSAPP_REMINDER_INITIATED",
      entityType: "Member",
      entityId: member.id,
      details: {
        memberCode: member.memberCode,
        memberName: member.fullName,
        mobile: targetNumber,
      },
    });

    return NextResponse.json({
      success: true,
      whatsappUrl,
      reminderLogId: log.id,
      message: messageToSend,
    });
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
