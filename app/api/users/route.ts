import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const data = await req.json();

    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role === "ADMIN" ? "ADMIN" : "STAFF",
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logActivity({
      session,
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      details: { name: user.name, email: user.email, role: user.role },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { id, name, role, isActive, password } = await req.json();

    const dataToUpdate: any = {
      name: name?.trim(),
      role: role === "ADMIN" ? "ADMIN" : "STAFF",
      isActive: isActive !== undefined ? Boolean(isActive) : undefined,
    };

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    await logActivity({
      session,
      action: "USER_UPDATED",
      entityType: "User",
      entityId: id,
      details: { name: updated.name, role: updated.role, isActive: updated.isActive },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
