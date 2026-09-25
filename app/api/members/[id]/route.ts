import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";
import { computeMemberFeeStatus } from "@/lib/feeCalculator";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        plan: true,
        payments: {
          orderBy: { paymentDate: "desc" },
          include: { createdBy: { select: { name: true } }, plan: true },
        },
        reminders: {
          orderBy: { initiatedAt: "desc" },
          include: { initiatedBy: { select: { name: true } } },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const feeStatus = computeMemberFeeStatus({
      status: member.status,
      isArchived: member.isArchived,
      expiryDate: member.expiryDate,
      plan: member.plan,
      payments: member.payments,
    });

    return NextResponse.json({ ...member, feeStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const data = await req.json();

    const existing = await prisma.member.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updated = await prisma.member.update({
      where: { id },
      data: {
        fullName: data.fullName?.trim() || existing.fullName,
        mobile: data.mobile?.trim() || existing.mobile,
        whatsapp: data.whatsapp !== undefined ? data.whatsapp?.trim() : existing.whatsapp,
        email: data.email !== undefined ? data.email?.trim() : existing.email,
        dob: data.dob ? new Date(data.dob) : existing.dob,
        gender: data.gender || existing.gender,
        address: data.address !== undefined ? data.address : existing.address,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : existing.joiningDate,
        emergencyContact: data.emergencyContact !== undefined ? data.emergencyContact : existing.emergencyContact,
        planId: data.planId || existing.planId,
        startDate: data.startDate ? new Date(data.startDate) : existing.startDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : existing.expiryDate,
        status: data.status || existing.status,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
      include: { plan: true },
    });

    await logActivity({
      session,
      action: "MEMBER_UPDATE",
      entityType: "Member",
      entityId: id,
      details: { changes: data },
    });

    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const updated = await prisma.member.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        status: "ARCHIVED",
      },
    });

    await logActivity({
      session,
      action: "MEMBER_ARCHIVED",
      entityType: "Member",
      entityId: id,
      details: { memberCode: updated.memberCode, name: updated.fullName },
    });

    return NextResponse.json({
      success: true,
      message: "Member archived safely. Payment and fee records preserved.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}