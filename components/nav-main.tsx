"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavGroup } from "@/lib/navigation-data";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items = [] }: { items?: NavGroup[] }) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // If items is undefined or null, return early
  if (!items || items.length === 0) {
    return null;
  }

  // Function to check if an icon is an animated custom icon
  // es-lint-disable-next-line @typescript-eslint/no-explicit-any
  const isAnimatedIcon = (Icon: any) => {
    // Check if the icon has a displayName
    if (!Icon || !Icon.displayName) return false;

    // Our naming convention: custom animated icons end with "Icon" but don't start with "Icon"
    // This distinguishes them from Tabler icons which all start with "Icon"
    return (
      Icon.displayName.endsWith("Icon") && !Icon.displayName.startsWith("Icon")
    );
  };

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items &&
                group.items.map((item) => {
                  const isActive = pathname === item.url;
                  const Icon = item.icon;
                  const isHovered = hoveredItem === `${item.title}-${item.url}`;

                  // Check if this is an animated icon using our function
                  const isAnimated = Icon && isAnimatedIcon(Icon);

                  return (
                    <SidebarMenuItem
                      key={item.title}
                      onMouseEnter={() =>
                        setHoveredItem(`${item.title}-${item.url}`)
                      }
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        asChild
                        className="data-[active=true]:bg-zinc-200/80 data-[active=true]:text-sidebar-accent-foreground hover:bg-zinc-200/80"
                      >
                        <Link
                          href={item.url}
                          className="flex items-center gap-2 w-full"
                        >
                          <div className="w-5 flex justify-center">
                            {item.icon &&
                              (isAnimated ? (
                                <Icon size={16} isHovered={isHovered} />
                              ) : (
                                <Icon size={18} />
                              ))}
                          </div>
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
