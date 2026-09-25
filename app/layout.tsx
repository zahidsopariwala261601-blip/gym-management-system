import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GYM Fee & Membership Management System",
  description: "Secure, reliable gym membership, payments, fee due tracking, multi-layer backups, and WhatsApp reminders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090D16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
