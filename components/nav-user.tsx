"use client";

import React from "react"; // Import React
import {
  IconLogout,
  IconUserCircle,
  IconCrown,
  IconShield,
} from "@tabler/icons-react"; // Add IconUserCircle, IconCrown, IconShield
import { useUserStore, useUserActions } from "@/lib/store/user-store"; // Import store and actions
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link"; // Import Link for login button
import { useRouter } from "next/navigation";
// Badge is no longer needed here if only icons are used for admin/super_admin
// import { Badge } from "@/components/ui/badge";
import { LogoutIcon } from "./icons/logout";
import { Hint } from "./hint";

export function NavUser() {
  // Get state and actions from Zustand store
  const { user, profile, isLoggedIn, isLoading } = useUserStore();
  const { signOut } = useUserActions();
  const router = useRouter();
  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent parent click
    signOut(); // Call the signOut action from the store
    router.push("/");
  };

  const hideEmail = (email: string): string => {
    if (!email || !email.includes("@")) return email; // Return original if invalid or no @

    const [username, domain] = email.split("@");

    if (username.length <= 2) {
      // If username is 2 chars or less, don't hide anything (or maybe show first char + *)
      // Let's return as is for simplicity, e.g., "ab@domain.com"
      return email;
      // Or: return `${username.charAt(0)}*@${domain}`; // for "a*@domain.com"
    }

    const firstChar = username.charAt(0);
    const lastChar = username.charAt(username.length - 1);
    // Calculate number of asterisks needed (length - 2)
    const middleAsterisks = "*".repeat(username.length - 2);

    const hiddenUsername = `${firstChar}${middleAsterisks}${lastChar}`;
    return `${hiddenUsername}@${domain}`;
  };

  // --- Loading State ---
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left text-sm leading-tight gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // --- Not Logged In State ---
  if (!isLoggedIn || (!user && !profile)) {
    // Optionally render a login button or nothing
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <Link href="/login">
            <SidebarMenuButton size="lg">
              <IconUserCircle className="size-6" />
              <span className="flex-1 text-left text-sm font-medium">
                Sign In
              </span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    );
    // return null; // Or return null if you don't want to show anything
  }

  // --- Logged In State ---
  // Determine display name, email, and avatar
  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.user_metadata?.name || user?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user?.email || "No email";
  const displayAvatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url || "";
  // You can access the role here if needed: const userRole = profile?.role;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={displayAvatar} alt={displayName} />
            {/* Basic fallback with initials */}
            <AvatarFallback className="rounded-lg bg-muted text-muted-foreground">
              {displayName
                ?.split(" ")
                .map((n: string) => n[0]) // Add explicit type string for 'n'
                .join("")
                .toUpperCase() || <IconUserCircle className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            {/* Name */}
            <div className="flex items-center gap-1">
              <span className="truncate font-medium">{displayName}</span>
              {/* Conditional Icon based on role */}
              {profile?.role === "super_admin" && (
                <Hint label="Super Admin">
                  <span>
                    <IconCrown className="size-5 text-yellow-700 fill-yellow-500 ml-1" />
                  </span>
                </Hint>
              )}
              {profile?.role === "admin" && (
                <Hint label="Admin">
                  <span>
                    <IconShield className="size-5 text-blue-700 fill-blue-500 ml-1" />
                  </span>
                </Hint>
              )}
              {/* Optional: Keep Badge for other roles if needed */}
              {/* {profile?.role && profile.role !== 'super_admin' && profile.role !== 'admin' && (
                <Badge
                  variant="secondary"
                  className="capitalize text-xs px-1.5 py-0.5 mt-1 w-fit"
                >
                  {profile.role.replace("_", " ")}
                </Badge>
              )} */}
            </div>
            {/* Email */}
            <span className="text-muted-foreground truncate text-xs">
              {displayEmail ? hideEmail(displayEmail) : ""}
            </span>
          </div>
          <div
            onClick={handleLogout}
            className="ml-auto cursor-pointer hover:text-sidebar-accent-foreground"
            role="button"
            aria-label="Logout"
          >
            <LogoutIcon className="w-8 h-8" />
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
