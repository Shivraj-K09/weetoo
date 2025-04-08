import type React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider";
import { AdminOtpVerification } from "@/components/admin/admin-otp-verification"; // Import the new component

export const metadata: Metadata = {
  title: "Admin - Weetoo",
  description: "Weetoo: A Trading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap the entire layout structure with the OTP verification component
    <AdminOtpVerification>
      <div suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider
            className="h-full w-full overflow-hidden"
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AdminSidebar variant="inset" />
            <SidebarInset className="border md:peer-data-[variant=inset]:shadow-none flex flex-col outline-hidden no-scrollbar">
              <SiteHeader />
              <div className="flex-1 overflow-y-auto">
                <div className="@container/main flex flex-col gap-2">
                  <div className="flex flex-col gap-3 md:gap-6">
                    <div className="p-4">{children}</div>
                  </div>
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </div>
    </AdminOtpVerification>
  );
}
