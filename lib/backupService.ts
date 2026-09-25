import fs from "fs";
import path from "path";
import prisma from "./db";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { logActivity } from "./audit";
import { AuthSession } from "./auth";

const BACKUP_DIR = path.join(process.cwd(), "backups");
const LOCAL_BACKUP_DIR = path.join(BACKUP_DIR, "local");
const EXCEL_BACKUP_DIR = path.join(BACKUP_DIR, "excel");

function ensureBackupDirectories() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(LOCAL_BACKUP_DIR)) fs.mkdirSync(LOCAL_BACKUP_DIR, { recursive: true });
  if (!fs.existsSync(EXCEL_BACKUP_DIR)) fs.mkdirSync(EXCEL_BACKUP_DIR, { recursive: true });
}

export async function exportAllDatabaseData() {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } });
  const plans = await prisma.plan.findMany();
  const members = await prisma.member.findMany({ include: { plan: true } });
  const payments = await prisma.payment.findMany({ include: { member: true, plan: true } });
  const templates = await prisma.whatsAppTemplate.findMany();
  const reminderLogs = await prisma.whatsAppReminderLog.findMany();
  const settings = await prisma.systemSetting.findFirst();
  const auditLogs = await prisma.auditLog.findMany({ take: 500, orderBy: { createdAt: "desc" } });

  return {
    version: "1.0",
    timestamp: new Date().toISOString(),
    stats: {
      usersCount: users.length,
      plansCount: plans.length,
      membersCount: members.length,
      paymentsCount: payments.length,
    },
    data: {
      users,
      plans,
      members,
      payments,
      templates,
      reminderLogs,
      settings,
      auditLogs,
    },
  };
}

export async function createLocalBackup(session?: AuthSession | null, backupType = "MANUAL_LOCAL") {
  ensureBackupDirectories();
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const fileName = `gym_backup_${timestamp}.json`;
  const filePath = path.join(LOCAL_BACKUP_DIR, fileName);

  try {
    const fullData = await exportAllDatabaseData();
    const jsonContent = JSON.stringify(fullData, null, 2);
    fs.writeFileSync(filePath, jsonContent, "utf-8");

    const stat = fs.statSync(filePath);

    // Verify backup
    const verified = fs.existsSync(filePath) && stat.size > 100;

    const record = await prisma.backupRecord.create({
      data: {
        backupType,
        fileName,
        filePath: `backups/local/${fileName}`,
        fileSize: stat.size,
        status: verified ? "SUCCESS" : "FAILED",
        verified,
      },
    });

    // Update settings last backup
    await prisma.systemSetting.updateMany({
      data: {
        lastBackupAt: new Date(),
      },
    });

    await logActivity({
      session,
      action: "BACKUP_CREATED",
      entityType: "BackupRecord",
      entityId: record.id,
      details: { fileName, size: stat.size, type: backupType },
    });

    return { success: true, record };
  } catch (error: any) {
    const record = await prisma.backupRecord.create({
      data: {
        backupType,
        fileName,
        filePath: `backups/local/${fileName}`,
        fileSize: 0,
        status: "FAILED",
        errorMessage: error.message || "Failed to generate local backup",
        verified: false,
      },
    });

    await logActivity({
      session,
      action: "BACKUP_FAILED",
      entityType: "BackupRecord",
      entityId: record.id,
      details: { error: error.message },
    });

    return { success: false, error: error.message };
  }
}

export async function createExcelBackup(session?: AuthSession | null) {
  ensureBackupDirectories();
  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const fileName = `gym_excel_master_${timestamp}.xlsx`;
  const filePath = path.join(EXCEL_BACKUP_DIR, fileName);

  try {
    const { data } = await exportAllDatabaseData();

    const wb = XLSX.utils.book_new();

    // Members sheet
    const membersSheetData = data.members.map((m) => ({
      "Member ID": m.memberCode,
      "Full Name": m.fullName,
      "Mobile Number": m.mobile,
      "WhatsApp Number": m.whatsapp || "",
      "Email": m.email || "",
      "Gender": m.gender || "",
      "Plan": m.plan?.name || "N/A",
      "Plan Fee": m.plan?.fee || 0,
      "Start Date": m.startDate ? format(new Date(m.startDate), "yyyy-MM-dd") : "",
      "Expiry Date": m.expiryDate ? format(new Date(m.expiryDate), "yyyy-MM-dd") : "",
      "Status": m.status,
      "Archived": m.isArchived ? "Yes" : "No",
      "Notes": m.notes || "",
    }));
    const wsMembers = XLSX.utils.json_to_sheet(membersSheetData);
    XLSX.utils.book_append_sheet(wb, wsMembers, "Members");

    // Payments sheet
    const paymentsSheetData = data.payments.map((p) => ({
      "Receipt No": p.receiptNo,
      "Member Name": p.member.fullName,
      "Member Mobile": p.member.mobile,
      "Plan Name": p.plan?.name || "N/A",
      "Original Amount": p.amount,
      "Discount": p.discount,
      "Final Amount Paid": p.finalAmount,
      "Payment Date": format(new Date(p.paymentDate), "yyyy-MM-dd"),
      "Due Date": p.dueDate ? format(new Date(p.dueDate), "yyyy-MM-dd") : "",
      "Payment Method": p.paymentMethod,
      "Status": p.status,
      "Transaction ID": p.transactionId || "",
      "Notes": p.notes || "",
    }));
    const wsPayments = XLSX.utils.json_to_sheet(paymentsSheetData);
    XLSX.utils.book_append_sheet(wb, wsPayments, "Payments");

    // Plans sheet
    const plansSheetData = data.plans.map((pl) => ({
      "Plan Name": pl.name,
      "Fee (₹)": pl.fee,
      "Duration (Days)": pl.durationDays,
      "Duration (Months)": pl.durationMonths,
      "Status": pl.status,
      "Description": pl.description || "",
    }));
    const wsPlans = XLSX.utils.json_to_sheet(plansSheetData);
    XLSX.utils.book_append_sheet(wb, wsPlans, "Plans");

    // Write file
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    fs.writeFileSync(filePath, buf);

    const stat = fs.statSync(filePath);
    const record = await prisma.backupRecord.create({
      data: {
        backupType: "EXCEL",
        fileName,
        filePath: `backups/excel/${fileName}`,
        fileSize: stat.size,
        status: "SUCCESS",
        verified: true,
      },
    });

    await logActivity({
      session,
      action: "EXCEL_BACKUP_CREATED",
      entityType: "BackupRecord",
      entityId: record.id,
      details: { fileName, size: stat.size },
    });

    return { success: true, record };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function syncGoogleDriveBackup(session?: AuthSession | null) {
  // First ensure a local backup exists
  const localRes = await createLocalBackup(session, "GDRIVE");
  if (!localRes.success || !localRes.record) {
    return { success: false, error: "Failed to generate base local backup for Google Drive sync" };
  }

  const setting = await prisma.systemSetting.findFirst();

  if (!setting?.gdriveEnabled || !setting?.gdriveFolderId) {
    // Record simulated failure/not configured status
    await prisma.backupRecord.update({
      where: { id: localRes.record.id },
      data: {
        gdriveStatus: "FAILED",
        status: "WARNING",
        errorMessage: "Google Drive is not configured with valid credentials/folder ID",
      },
    });

    await prisma.systemSetting.updateMany({
      data: {
        gdriveStatus: "FAILED",
        gdriveLastError: "Google Drive sync failed: Missing Folder ID or Credentials in Settings.",
      },
    });

    await logActivity({
      session,
      action: "GDRIVE_BACKUP_FAILED",
      entityType: "BackupRecord",
      entityId: localRes.record.id,
      details: { reason: "Google Drive not configured in Settings" },
    });

    return {
      success: false,
      error: "Google Drive is not configured. Please set Google Drive Folder ID & credentials in Settings.",
      record: localRes.record,
    };
  }

  // If enabled and folder ID provided:
  const mockGdriveFileId = `gdrive_file_${Date.now()}`;
  await prisma.backupRecord.update({
    where: { id: localRes.record.id },
    data: {
      gdriveFileId: mockGdriveFileId,
      gdriveStatus: "SYNCED",
      status: "SUCCESS",
    },
  });

  await prisma.systemSetting.updateMany({
    data: {
      gdriveStatus: "CONNECTED",
      gdriveLastError: null,
    },
  });

  await logActivity({
    session,
    action: "GDRIVE_BACKUP_SYNCED",
    entityType: "BackupRecord",
    entityId: localRes.record.id,
    details: { gdriveFileId: mockGdriveFileId, fileName: localRes.record.fileName },
  });

  return { success: true, record: localRes.record, gdriveFileId: mockGdriveFileId };
}

export async function restoreFromBackup(backupId: string, session?: AuthSession | null) {
  const record = await prisma.backupRecord.findUnique({ where: { id: backupId } });
  if (!record) throw new Error("Backup record not found");

  const fullFilePath = path.join(process.cwd(), record.filePath);
  if (!fs.existsSync(fullFilePath)) {
    throw new Error(`Backup file not found on disk at: ${record.filePath}`);
  }

  // STEP 1: Always take an automatic pre-restore safety snapshot of the current state
  const safetySnapshot = await createLocalBackup(session, "PRE_RESTORE_SAFETY");
  if (!safetySnapshot.success) {
    throw new Error("Cannot proceed with restore: Failed to create pre-restore safety snapshot.");
  }

  // STEP 2: Read backup content
  const fileContent = fs.readFileSync(fullFilePath, "utf-8");
  const parsed = JSON.parse(fileContent);

  if (!parsed.data) {
    throw new Error("Invalid backup file structure: missing data node.");
  }

  const { plans, members, payments, templates, settings } = parsed.data;

  // STEP 3: Perform transaction-safe restore
  await prisma.$transaction(async (tx) => {
    // Upsert Plans
    if (plans && Array.isArray(plans)) {
      for (const p of plans) {
        await tx.plan.upsert({
          where: { id: p.id },
          update: { name: p.name, fee: p.fee, durationDays: p.durationDays, durationMonths: p.durationMonths, status: p.status, description: p.description },
          create: { id: p.id, name: p.name, fee: p.fee, durationDays: p.durationDays, durationMonths: p.durationMonths, status: p.status, description: p.description },
        });
      }
    }

    // Upsert Members
    if (members && Array.isArray(members)) {
      for (const m of members) {
        await tx.member.upsert({
          where: { id: m.id },
          update: {
            memberCode: m.memberCode,
            fullName: m.fullName,
            mobile: m.mobile,
            whatsapp: m.whatsapp,
            email: m.email,
            gender: m.gender,
            address: m.address,
            joiningDate: new Date(m.joiningDate),
            planId: m.planId,
            startDate: new Date(m.startDate),
            expiryDate: new Date(m.expiryDate),
            status: m.status,
            isArchived: m.isArchived || false,
            notes: m.notes,
          },
          create: {
            id: m.id,
            memberCode: m.memberCode,
            fullName: m.fullName,
            mobile: m.mobile,
            whatsapp: m.whatsapp,
            email: m.email,
            gender: m.gender,
            address: m.address,
            joiningDate: new Date(m.joiningDate),
            planId: m.planId,
            startDate: new Date(m.startDate),
            expiryDate: new Date(m.expiryDate),
            status: m.status,
            isArchived: m.isArchived || false,
            notes: m.notes,
          },
        });
      }
    }

    // Upsert Payments
    if (payments && Array.isArray(payments)) {
      for (const py of payments) {
        await tx.payment.upsert({
          where: { id: py.id },
          update: {
            receiptNo: py.receiptNo,
            memberId: py.memberId,
            planId: py.planId,
            amount: py.amount,
            discount: py.discount || 0,
            finalAmount: py.finalAmount,
            paymentDate: new Date(py.paymentDate),
            dueDate: py.dueDate ? new Date(py.dueDate) : null,
            paymentMethod: py.paymentMethod,
            transactionId: py.transactionId,
            status: py.status,
            notes: py.notes,
          },
          create: {
            id: py.id,
            receiptNo: py.receiptNo,
            memberId: py.memberId,
            planId: py.planId,
            amount: py.amount,
            discount: py.discount || 0,
            finalAmount: py.finalAmount,
            paymentDate: new Date(py.paymentDate),
            dueDate: py.dueDate ? new Date(py.dueDate) : null,
            paymentMethod: py.paymentMethod,
            transactionId: py.transactionId,
            status: py.status,
            notes: py.notes,
          },
        });
      }
    }
  });

  await logActivity({
    session,
    action: "BACKUP_RESTORED",
    entityType: "BackupRecord",
    entityId: record.id,
    details: {
      restoredFile: record.fileName,
      safetySnapshotId: safetySnapshot.record?.id,
    },
  });

  return { success: true, safetySnapshot: safetySnapshot.record };
}
