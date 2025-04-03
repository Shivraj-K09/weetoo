"use client";

import { UserSidebar } from "@/components/left-sidebar/user-sidebar";
import { Navigation } from "@/components/navigation/navigation";
import { TopBar } from "@/components/navigation/top-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const pathname = usePathname();

  // const hideRightSidebarOn = ["/trading-competition"];

  // const shouldHideRightSidebar = hideRightSidebarOn.some(
  //   (path) => pathname === path || pathname.startsWith(`${path}/`)
  // );

  return (
    <div className="flex flex-col h-full">
      <div className="w-full h-full flex flex-col">
        <TopBar />
        <Navigation />
        {/* <NavigationMenuDemo /> */}
        <div className="xl:container lg:px-7 w-full xl:mx-auto py-2 gap-4 flex">
          <UserSidebar />
          <div className="flex-1 h-full w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
