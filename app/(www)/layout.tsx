"use client";

import { Navigation } from "@/components/navigation";
import { RightSidebar } from "@/components/right-sidebar";
import { TopBar } from "@/components/top-bar";
import { UserSidebar } from "@/components/user-sidebar";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideRightSidebarOn = ["/trading-competition"];

  const shouldHideRightSidebar = hideRightSidebarOn.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="w-full h-full flex flex-col">
        <TopBar />
        <Navigation />
        <div className="container w-full mx-auto py-2 gap-4 flex ">
          <UserSidebar />
          <div className="flex flex-1 h-full">{children}</div>
          {!shouldHideRightSidebar && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}
