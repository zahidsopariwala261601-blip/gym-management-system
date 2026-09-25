import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function GET() {
  try {
    await requireAuth();
    const templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { id, templateBody, title } = await req.json();

    const template = await prisma.whatsAppTemplate.update({
      where: { id },
      data: {
        templateBody,
        title: title || undefined,
      },
    });

    await logActivity({
      session,
      action: "WHATSAPP_TEMPLATE_UPDATED",
      entityType: "WhatsAppTemplate",
      entityId: id,
      details: { title: template.title },
    });

    return NextResponse.json({ success: true, template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
