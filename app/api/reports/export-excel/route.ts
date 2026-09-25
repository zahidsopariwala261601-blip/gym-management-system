import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateExcelBuffer } from "@/lib/exportService";
import { format } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();

    const members = await prisma.member.findMany({ include: { plan: true } });
    const payments = await prisma.payment.findMany({ include: { member: true, plan: true } });
    const plans = await prisma.plan.findMany();

    const sheets = [
      {
        name: "Members",
        data: members.map((m) => ({
          "Member ID": m.memberCode,
          "Full Name": m.fullName,
          "Mobile": m.mobile,
          "WhatsApp": m.whatsapp || "",
          "Email": m.email || "",
          "Plan": m.plan?.name || "N/A",
          "Joining Date": format(new Date(m.joiningDate), "yyyy-MM-dd"),
          "Expiry Date": format(new Date(m.expiryDate), "yyyy-MM-dd"),
          "Status": m.status,
        })),
      },
      {
        name: "Payments",
        data: payments.map((p) => ({
          "Receipt No": p.receiptNo,
          "Member": p.member.fullName,
          "Member Code": p.member.memberCode,
          "Plan": p.plan?.name || "N/A",
          "Amount Paid (₹)": p.finalAmount,
          "Payment Date": format(new Date(p.paymentDate), "yyyy-MM-dd"),
          "Method": p.paymentMethod,
          "Status": p.status,
          "Transaction ID": p.transactionId || "",
        })),
      },
      {
        name: "Plans",
        data: plans.map((pl) => ({
          "Plan Name": pl.name,
          "Fee (₹)": pl.fee,
          "Duration Days": pl.durationDays,
          "Status": pl.status,
        })),
      },
    ];

    const buffer = generateExcelBuffer(sheets);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="gym_report_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
