import { getSession } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const setting = await prisma.systemSetting.findFirst();

  return (
    <div className="min-h-screen bg-[#090D16] flex flex-col lg:flex-row text-slate-100">
      <Sidebar
        user={{
          name: session.name,
          email: session.email,
          role: session.role,
        }}
        gymName={setting?.gymName || "THE GYM"}
      />
      <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
