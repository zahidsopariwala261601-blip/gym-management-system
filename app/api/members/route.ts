import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { computeMemberFeeStatus } from "@/lib/feeCalculator";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const planId = searchParams.get("planId") || "ALL";
    const showArchived = searchParams.get("archived") === "true";

    const where: any = {
      isArchived: showArchived,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { memberCode: { contains: search } },
        { mobile: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    if (planId !== "ALL") {
      where.planId = planId;
    }

    if (status !== "ALL") {
      where.status = status;
    }

    const members = await prisma.member.findMany({
      where,
      include: {
        plan: true,
        payments: {
          orderBy: { paymentDate: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enhanced = members.map((m) => {
      const feeStatus = computeMemberFeeStatus({
        status: m.status,
        isArchived: m.isArchived,
        expiryDate: m.expiryDate,
        plan: m.plan,
        payments: m.payments,
      });

      return {
        ...m,
        feeStatus,
      };
    });

    return NextResponse.json(enhanced);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const data = await req.json();

    if (!data.fullName || !data.mobile || !data.planId) {
      return NextResponse.json(
        { error: "Full Name, Mobile Number, and Membership Plan are required." },
        { status: 400 }
      );
    }

    const plan = await prisma.plan.findUnique({ where: { id: data.planId } });
    if (!plan) {
      return NextResponse.json({ error: "Invalid membership plan selected." }, { status: 400 });
    }

    const count = await prisma.member.count();
    const memberCode = "GYM-" + (1000 + count + 1);

    const startDate = data.startDate ? new Date(data.startDate) : new Date();
    const expiryDate = data.expiryDate
      ? new Date(data.expiryDate)
      : new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const member = await prisma.member.create({
      data: {
        memberCode,
        fullName: data.fullName.trim(),
        mobile: data.mobile.trim(),
        whatsapp: data.whatsapp ? data.whatsapp.trim() : data.mobile.trim(),
        email: data.email ? data.email.trim() : null,
        dob: data.dob ? new Date(data.dob) : null,
        gender: data.gender || "Male",
        address: data.address || null,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        profilePhoto: data.profilePhoto || null,
        emergencyContact: data.emergencyContact || null,
        planId: plan.id,
        startDate,
        expiryDate,
        status: "ACTIVE",
        notes: data.notes || null,
      },
      include: { plan: true },
    });

    if (data.initialPayment) {
      const receiptCount = await prisma.payment.count();
      const receiptNo = "RCP-" + new Date().getFullYear() + "-" + String(receiptCount + 1).padStart(4, "0");
      const amount = Number(data.initialPayment.amount) || plan.fee;
      const discount = Number(data.initialPayment.discount) || 0;
      const finalAmount = Math.max(0, amount - discount);

      await prisma.payment.create({
        data: {
          receiptNo,
          memberId: member.id,
          planId: plan.id,
          amount,
          discount,
          finalAmount,
          paymentDate: new Date(),
          dueDate: expiryDate,
          paymentMethod: data.initialPayment.method || "CASH",
          transactionId: data.initialPayment.transactionId || null,
          status: "PAID",
          notes: "Initial membership fee",
          createdById: session.userId,
        },
      });
    }

    await logActivity({
      session,
      action: "MEMBER_CREATE",
      entityType: "Member",
      entityId: member.id,
      details: {
        memberCode: member.memberCode,
        fullName: member.fullName,
        planName: plan.name,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error("Member creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
