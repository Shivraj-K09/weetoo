"use client";

import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "../nav-main";
import { NavUser } from "../nav-user";
import { navigationData } from "@/lib/navigation-data";

const data = {
  user: {
    name: "Test User",
    email: "test-user@example.com",
    avatar:
      "https://images.unsplash.com/photo-1499281851221-5bce936073b0?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
};

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Make sure navigationData is defined before passing it to NavMain
  const navItems = navigationData || [];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <span>W</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <div className="font-semibold">
                    <span className="text-[#e74c3c]">W</span>
                    <span>EE</span>
                    <span className="text-[#e74c3c]">T</span>
                    <span>OO</span>
                  </div>
                  <span className="text-xs">Admin Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
