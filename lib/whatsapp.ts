import { format } from "date-fns";

export interface TemplateVariables {
  member_name: string;
  amount: string | number;
  due_date?: string | Date;
  expiry_date?: string | Date;
  start_date?: string | Date;
  plan_name?: string;
  gym_name?: string;
  gym_phone?: string;
  receipt_no?: string;
  payment_date?: string | Date;
  currency?: string;
}

export function renderWhatsAppMessage(
  templateString: string,
  vars: TemplateVariables
): string {
  let text = templateString;

  const formatDateVal = (v: any) => {
    if (!v) return "N/A";
    try {
      return format(new Date(v), "dd MMM yyyy");
    } catch {
      return String(v);
    }
  };

  const replacements: Record<string, string> = {
    "{member_name}": vars.member_name || "Member",
    "{amount}": vars.amount !== undefined ? String(vars.amount) : "0",
    "{due_date}": formatDateVal(vars.due_date),
    "{expiry_date}": formatDateVal(vars.expiry_date),
    "{start_date}": formatDateVal(vars.start_date),
    "{payment_date}": formatDateVal(vars.payment_date),
    "{plan_name}": vars.plan_name || "Membership Plan",
    "{gym_name}": vars.gym_name || "Our Gym",
    "{gym_phone}": vars.gym_phone || "",
    "{receipt_no}": vars.receipt_no || "",
    "{currency}": vars.currency || "₹",
  };

  for (const [key, value] of Object.entries(replacements)) {
    text = text.replaceAll(key, value);
  }

  return text;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  // Clean phone number: remove spaces, dashes, parentheses
  let cleaned = phone.replace(/[^0-9+]/g, "");
  // If starts with +, remove + for wa.me URL
  cleaned = cleaned.replace(/^\+/, "");

  // If number does not have country code, assuming 91 (India) if 10 digits
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encodedMessage}`;
}
