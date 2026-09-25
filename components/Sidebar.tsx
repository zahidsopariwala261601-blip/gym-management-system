"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  ClockAlert,
  MessageSquare,
  FileBarChart,
  Database,
  History,
  Settings,
  LogOut,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: { name: string; email: string; role: string } | null;
  gymName: string;
}

export default function Sidebar({ user, gymName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Members", href: "/members", icon: Users },
    { label: "Plans", href: "/plans", icon: Dumbbell },
    { label: "Payments", href: "/payments", icon: CreditCard },
    { label: "Fee Due Center", href: "/fee-due", icon: ClockAlert },
    { label: "WhatsApp Reminders", href: "/whatsapp", icon: MessageSquare },
    { label: "Reports & Analytics", href: "/reports", icon: FileBarChart },
    { label: "Backup & Restore", href: "/backups", icon: Database, adminOnly: true },
    { label: "Audit Logs", href: "/audit-logs", icon: History, adminOnly: true },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  const renderNavLinks = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Gym Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/20">
            🏋️
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm tracking-wide text-white truncate">{gymName || "THE GYM"}</h1>
            <p className="text-xs text-amber-400 font-medium">Fee & Member Portal</p>
          </div>
        </div>

        {/* User Badge */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "Staff"}</p>
              <div className="flex items-center gap-1">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="w-2.5 h-2.5" /> ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    <UserCheck className="w-2.5 h-2.5" /> STAFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;

            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-amber-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-slate-950" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 text-white">
        <div className="flex items-center gap-2 font-bold text-sm">
          <span className="text-xl">🏋️</span>
          <span>{gymName || "THE GYM"}</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex">
          <div className="w-72 bg-slate-950 border-r border-slate-800 h-full p-0">
            {renderNavLinks()}
          </div>
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-slate-950/95 border-r border-slate-800/80 h-screen sticky top-0 overflow-y-auto">
        {renderNavLinks()}
      </aside>
    </>
  );
}
