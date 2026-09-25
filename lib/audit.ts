import prisma from "./db";
import { AuthSession } from "./auth";

export async function logActivity({
  session,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}: {
  session?: AuthSession | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}) {
  try {
    const detailsStr =
      typeof details === "object" ? JSON.stringify(details) : details || null;

    await prisma.auditLog.create({
      data: {
        userId: session?.userId || null,
        userName: session?.name || "System/Anonymous",
        userRole: session?.role || "SYSTEM",
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: detailsStr,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
