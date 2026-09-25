import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getSession } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (session) {
      await logActivity({
        session,
        action: "LOGOUT",
        entityType: "User",
        entityId: session.userId,
      });
    }

    await clearAuthCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
