"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentPageTitle } from "@/lib/navigation-data";
import { DevIndicator } from "./dev-indicator";
import { ModeToggle } from "./mode-toggle";

export function SiteHeader() {
  const pathname = usePathname();
  const pageTitle = getCurrentPageTitle(pathname);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 z-30 flex h-14 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear rounded-tl-xl rounded-tr-xl">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6 ">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1 h-4 w-4 cursor-pointer" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <span className="text-sm font-medium">{pageTitle}</span>
        </div>
        <div className="flex items-center gap-2 lg:gap-5">
          <DevIndicator />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
