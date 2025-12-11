"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AuthReadyProvider } from "@/components/auth-ready-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthReadyProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[240px_1fr] bg-muted/20">
        {/* Desktop Sidebar */}
        <aside className="hidden border-r bg-card lg:block h-screen sticky top-0 overflow-y-auto">
          <Sidebar />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[240px]">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-col">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </AuthReadyProvider>
  );
}