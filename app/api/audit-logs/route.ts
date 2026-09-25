import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const search = searchParams.get("search");

    const where: any = {};
    if (action && action !== "ALL") where.action = action;
    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { action: { contains: search } },
        { details: { contains: search } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true, role: true } } },
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
