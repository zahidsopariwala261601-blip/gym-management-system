import { differenceInCalendarDays, startOfDay, isBefore, isAfter } from "date-fns";

export type FeeDueCategory =
  | "DUE_TODAY"
  | "DUE_TOMORROW"
  | "DUE_IN_3_DAYS"
  | "DUE_IN_7_DAYS"
  | "OVERDUE"
  | "EXPIRING_SOON"
  | "ACTIVE"
  | "FROZEN"
  | "ARCHIVED";

export interface MemberFeeStatus {
  category: FeeDueCategory;
  categoryLabel: string;
  daysDiff: number; // positive = days until due, negative = days overdue
  badgeColor: string;
  isEligibleForReminder: boolean;
  calculatedAmount: number;
}

export function computeMemberFeeStatus(member: {
  status: string;
  isArchived: boolean;
  expiryDate: Date | string;
  plan?: { fee: number } | null;
  payments?: { status: string; finalAmount: number; dueDate?: Date | string | null }[];
}): MemberFeeStatus {
  if (member.isArchived) {
    return {
      category: "ARCHIVED",
      categoryLabel: "Archived",
      daysDiff: 0,
      badgeColor: "bg-gray-100 text-gray-700 border-gray-300",
      isEligibleForReminder: false,
      calculatedAmount: 0,
    };
  }

  if (member.status === "FROZEN") {
    return {
      category: "FROZEN",
      categoryLabel: "Frozen",
      daysDiff: 0,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
      isEligibleForReminder: false,
      calculatedAmount: 0,
    };
  }

  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(member.expiryDate));
  const daysDiff = differenceInCalendarDays(expiry, today);
  const fee = member.plan?.fee || 1500;

  if (daysDiff < 0) {
    return {
      category: "OVERDUE",
      categoryLabel: `Overdue by ${Math.abs(daysDiff)} day(s)`,
      daysDiff,
      badgeColor: "bg-red-100 text-red-800 border-red-300",
      isEligibleForReminder: true,
      calculatedAmount: fee,
    };
  }

  if (daysDiff === 0) {
    return {
      category: "DUE_TODAY",
      categoryLabel: "Due Today",
      daysDiff,
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      isEligibleForReminder: true,
      calculatedAmount: fee,
    };
  }

  if (daysDiff === 1) {
    return {
      category: "DUE_TOMORROW",
      categoryLabel: "Due Tomorrow",
      daysDiff,
      badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      isEligibleForReminder: true,
      calculatedAmount: fee,
    };
  }

  if (daysDiff <= 3) {
    return {
      category: "DUE_IN_3_DAYS",
      categoryLabel: `Due in ${daysDiff} days`,
      daysDiff,
      badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
      isEligibleForReminder: true,
      calculatedAmount: fee,
    };
  }

  if (daysDiff <= 7) {
    return {
      category: "DUE_IN_7_DAYS",
      categoryLabel: `Due in ${daysDiff} days`,
      daysDiff,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      isEligibleForReminder: true,
      calculatedAmount: fee,
    };
  }

  return {
    category: "ACTIVE",
    categoryLabel: `Active (${daysDiff} days left)`,
    daysDiff,
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    isEligibleForReminder: false,
    calculatedAmount: 0,
  };
}
