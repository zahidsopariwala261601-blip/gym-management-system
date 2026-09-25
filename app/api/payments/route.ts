import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const method = searchParams.get("method");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const where: any = {};

    if (memberId) where.memberId = memberId;
    if (method && method !== "ALL") where.paymentMethod = method;
    if (status && status !== "ALL") where.status = status;

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = startOfDay(new Date(startDate));
      if (endDate) where.paymentDate.lte = endOfDay(new Date(endDate));
    }

    if (search) {
      where.OR = [
        { receiptNo: { contains: search } },
        { transactionId: { contains: search } },
        { member: { fullName: { contains: search } } },
        { member: { memberCode: { contains: search } } },
        { member: { mobile: { contains: search } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        member: { select: { id: true, memberCode: true, fullName: true, mobile: true, whatsapp: true } },
        plan: { select: { id: true, name: true, fee: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { paymentDate: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();

    if (!data.memberId || data.amount === undefined) {
      return NextResponse.json({ error: "Member and Amount are required" }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: data.memberId },
      include: { plan: true },
    });
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const count = await prisma.payment.count();
    const receiptNo = "RCP-" + new Date().getFullYear() + "-" + String(count + 1).padStart(4, "0");

    const amount = Number(data.amount) || 0;
    const discount = Number(data.discount) || 0;
    const finalAmount = Math.max(0, amount - discount);
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : new Date();

    const planId = data.planId || member.planId;
    let plan = member.plan;
    if (data.planId && data.planId !== member.planId) {
      plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    }

    // Determine new expiry date if extending membership
    let newExpiryDate = member.expiryDate;
    if (data.extendMembership && plan) {
      const baseDate = new Date(member.expiryDate) > new Date() ? new Date(member.expiryDate) : paymentDate;
      newExpiryDate = new Date(baseDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      await prisma.member.update({
        where: { id: member.id },
        data: {
          expiryDate: newExpiryDate,
          planId: plan.id,
          status: "ACTIVE",
        },
      });
    }

    const payment = await prisma.payment.create({
      data: {
        receiptNo,
        memberId: member.id,
        planId: plan?.id || null,
        amount,
        discount,
        finalAmount,
        paymentDate,
        dueDate: data.dueDate ? new Date(data.dueDate) : newExpiryDate,
        paymentMethod: data.paymentMethod || "CASH",
        transactionId: data.transactionId || null,
        status: data.status || "PAID",
        notes: data.notes || null,
        createdById: session.userId,
      },
      include: {
        member: true,
        plan: true,
        createdBy: { select: { name: true } },
      },
    });

    await logActivity({
      session,
      action: "PAYMENT_ADD",
      entityType: "Payment",
      entityId: payment.id,
      details: {
        receiptNo,
        memberCode: member.memberCode,
        memberName: member.fullName,
        amount: finalAmount,
        method: payment.paymentMethod,
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
