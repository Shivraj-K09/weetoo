"use client";

import { NavigationMenuDemo } from "@/components/navigation/navigation-test";
import { RightSidebar } from "@/components/right-sidebar";
import { TopBar } from "@/components/navigation/top-bar";
import { UserSidebar } from "@/components/left-sidebar/user-sidebar";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/navigation/navigation";

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
    <div className="flex flex-col h-full">
      <div className="w-full h-full flex flex-col">
        <TopBar />
        <Navigation />
        {/* <NavigationMenuDemo /> */}
        <div className="container w-full mx-auto py-2 gap-4 flex">
          <UserSidebar />
          <div className="flex-1 h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
