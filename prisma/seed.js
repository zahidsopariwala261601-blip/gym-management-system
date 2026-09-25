const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // System Settings
  await prisma.systemSetting.upsert({
    where: { id: "default_setting" },
    update: {},
    create: {
      id: "default_setting",
      gymName: "THE GYM",
      gymPhone: "+91 98765 43210",
      gymEmail: "contact@ironpulsefitness.com",
      gymAddress: "Plot 42, 2nd Main Road, Cyber Hills, Metro City - 500081",
      currencySymbol: "₹",
      gdriveEnabled: false,
      gdriveStatus: "NOT_CONFIGURED",
      autoBackupHour: 2,
    },
  });

  // Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gym.com" },
    update: {},
    create: {
      name: "Super Administrator",
      email: "admin@gym.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@gym.com" },
    update: {},
    create: {
      name: "Front Desk Staff",
      email: "staff@gym.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      isActive: true,
    },
  });

  // Membership Plans
  const plansData = [
    { name: "Monthly Standard", durationMonths: 1, durationDays: 30, fee: 1500, description: "General gym floor access with cardio & weights", status: "ACTIVE" },
    { name: "Quarterly Pro", durationMonths: 3, durationDays: 90, fee: 4000, description: "3 Months access + 1 free personal fitness assessment", status: "ACTIVE" },
    { name: "Half-Yearly Elite", durationMonths: 6, durationDays: 180, fee: 7500, description: "6 Months access + locker + diet consultation", status: "ACTIVE" },
    { name: "Yearly Champion", durationMonths: 12, durationDays: 365, fee: 13500, description: "12 Months full access + steam bath + personal locker", status: "ACTIVE" },
    { name: "Personal Training Pack", durationMonths: 1, durationDays: 30, fee: 5000, description: "Dedicated 1-on-1 personal trainer sessions (12 sessions)", status: "ACTIVE" },
  ];

  const createdPlans = [];
  for (const p of plansData) {
    const existing = await prisma.plan.findFirst({ where: { name: p.name } });
    if (existing) {
      createdPlans.push(existing);
    } else {
      const plan = await prisma.plan.create({ data: p });
      createdPlans.push(plan);
    }
  }

  // WhatsApp Templates
  const templates = [
    {
      title: "Fee Due Reminder",
      templateType: "FEE_DUE",
      templateBody: "Hello {member_name},\n\nYour gym membership fee of {currency}{amount} is due on {due_date}.\n\nKindly make the payment to continue your uninterrupted membership.\n\nThank you,\n{gym_name}\n📞 {gym_phone}",
    },
    {
      title: "Overdue Fee Alert",
      templateType: "OVERDUE",
      templateBody: "Hello {member_name},\n\nYour gym membership fee of {currency}{amount} was due on {due_date} and is now OVERDUE.\n\nKindly clear your pending balance at the reception or via UPI to keep your access active.\n\nThank you,\n{gym_name}\n📞 {gym_phone}",
    },
    {
      title: "Membership Expiry Warning",
      templateType: "EXPIRY_WARNING",
      templateBody: "Hello {member_name},\n\nYour {plan_name} at {gym_name} will expire on {expiry_date}.\n\nRenew your plan before the due date to enjoy continuous fitness tracking!\n\nBest regards,\n{gym_name}",
    },
    {
      title: "New Member Welcome",
      templateType: "WELCOME",
      templateBody: "Welcome to {gym_name}, {member_name}! 🎉\n\nYour {plan_name} is active from {start_date} to {expiry_date}.\n\nWe are excited to help you achieve your fitness goals!\n\nContact: {gym_phone}",
    },
    {
      title: "Payment Receipt",
      templateType: "PAYMENT_RECEIPT",
      templateBody: "Hello {member_name},\n\nWe have received your payment of {currency}{amount} for {plan_name}.\nReceipt No: #{receipt_no}\nPayment Date: {payment_date}\n\nThank you for choosing {gym_name}!",
    },
  ];

  for (const t of templates) {
    await prisma.whatsAppTemplate.upsert({
      where: { templateType: t.templateType },
      update: {},
      create: t,
    });
  }

  // Sample Members with diverse states
  const sampleMembers = [
    {
      memberCode: "GYM-1001",
      fullName: "Rahul Sharma",
      mobile: "+919811122233",
      whatsapp: "+919811122233",
      email: "rahul.sharma@example.com",
      gender: "Male",
      address: "B-204, Cyber Green Apts",
      joiningDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      planId: createdPlans[0].id,
      startDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Overdue by 5 days
      status: "EXPIRED",
      notes: "Preferred workout time: Evening",
    },
    {
      memberCode: "GYM-1002",
      fullName: "Ahmed Khan",
      mobile: "+919822233344",
      whatsapp: "+919822233344",
      email: "ahmed.k@example.com",
      gender: "Male",
      address: "45 Hilltop Residency",
      joiningDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      planId: createdPlans[0].id,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(), // Due Today
      status: "EXPIRING_SOON",
      notes: "Focusing on cardio and fat loss",
    },
    {
      memberCode: "GYM-1003",
      fullName: "Raj Patel",
      mobile: "+919833344455",
      whatsapp: "+919833344455",
      email: "raj.patel@example.com",
      gender: "Male",
      address: "88 Orchid Villas",
      joiningDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      planId: createdPlans[1].id,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000), // Active
      status: "ACTIVE",
      notes: "Strength training & powerlifting",
    },
    {
      memberCode: "GYM-1004",
      fullName: "Priya Nair",
      mobile: "+919844455566",
      whatsapp: "+919844455566",
      email: "priya.nair@example.com",
      gender: "Female",
      address: "Flat 502, Sun Towers",
      joiningDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      planId: createdPlans[0].id,
      startDate: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Due in 3 days
      status: "EXPIRING_SOON",
      notes: "Zumba & Yoga sessions",
    },
    {
      memberCode: "GYM-1005",
      fullName: "Vikram Singh",
      mobile: "+919855566677",
      whatsapp: "+919855566677",
      email: "vikram.singh@example.com",
      gender: "Male",
      address: "12 Lakeview Avenue",
      joiningDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      planId: createdPlans[2].id,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      status: "FROZEN",
      notes: "Membership frozen due to business travel until next week",
    },
    {
      memberCode: "GYM-1006",
      fullName: "Sneha Reddy",
      mobile: "+919866677788",
      whatsapp: "+919866677788",
      email: "sneha.reddy@example.com",
      gender: "Female",
      address: "19 Rose Garden Enclave",
      joiningDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      planId: createdPlans[3].id,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      notes: "Annual member, crossfit enthusiast",
    },
  ];

  for (const m of sampleMembers) {
    const existing = await prisma.member.findUnique({ where: { memberCode: m.memberCode } });
    let memberId = existing?.id;
    if (!existing) {
      const created = await prisma.member.create({ data: m });
      memberId = created.id;
    }

    if (m.fullName === "Raj Patel") {
      const existingP = await prisma.payment.findUnique({ where: { receiptNo: "RCP-2026-001" } });
      if (!existingP) {
        await prisma.payment.create({
          data: {
            receiptNo: "RCP-2026-001",
            memberId: memberId,
            planId: m.planId,
            amount: 4000,
            discount: 0,
            finalAmount: 4000,
            paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 80 * 24 * 60 * 60 * 1000),
            paymentMethod: "UPI",
            transactionId: "UPI789123456",
            status: "PAID",
            notes: "3-Month Pro Plan fee received",
            createdById: staff.id,
          },
        });
      }
    } else if (m.fullName === "Sneha Reddy") {
      const existingP = await prisma.payment.findUnique({ where: { receiptNo: "RCP-2026-002" } });
      if (!existingP) {
        await prisma.payment.create({
          data: {
            receiptNo: "RCP-2026-002",
            memberId: memberId,
            planId: m.planId,
            amount: 13500,
            discount: 500,
            finalAmount: 13000,
            paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
            paymentMethod: "CARD",
            transactionId: "TXN_CC_998822",
            status: "PAID",
            notes: "Annual membership full payment with promotional discount",
            createdById: admin.id,
          },
        });
      }
    } else if (m.fullName === "Rahul Sharma") {
      const existingP = await prisma.payment.findUnique({ where: { receiptNo: "RCP-2026-003" } });
      if (!existingP) {
        await prisma.payment.create({
          data: {
            receiptNo: "RCP-2026-003",
            memberId: memberId,
            planId: m.planId,
            amount: 1500,
            discount: 0,
            finalAmount: 1500,
            paymentDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            paymentMethod: "CASH",
            status: "OVERDUE",
            notes: "Renewal due since 5 days",
            createdById: staff.id,
          },
        });
      }
    } else if (m.fullName === "Ahmed Khan") {
      const existingP = await prisma.payment.findUnique({ where: { receiptNo: "RCP-2026-004" } });
      if (!existingP) {
        await prisma.payment.create({
          data: {
            receiptNo: "RCP-2026-004",
            memberId: memberId,
            planId: m.planId,
            amount: 1200,
            discount: 0,
            finalAmount: 1200,
            paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            dueDate: new Date(),
            paymentMethod: "UPI",
            status: "PENDING",
            notes: "Due today renewal pending",
            createdById: staff.id,
          },
        });
      }
    }
  }

  // Initial audit log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      userRole: admin.role,
      action: "SYSTEM_INITIALIZED",
      entityType: "System",
      entityId: "init",
      details: JSON.stringify({ message: "Database initialized with default plans, templates, and sample gym members." }),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
