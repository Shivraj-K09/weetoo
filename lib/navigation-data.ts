import { ActivityIcon } from "@/components/icons/activity-icon";
import { DashboardIcon } from "@/components/icons/dashboard";
import { DepositIcon } from "@/components/icons/deposit-icon";
import { FilePenLineIcon } from "@/components/icons/file-pen-icon";
import { FingerprintIcon } from "@/components/icons/fingerprint-icon";
import { HistoryIcon } from "@/components/icons/history-icon";
import { LinkIcon } from "@/components/icons/link-icon";
import { NotificationIcon } from "@/components/icons/notification";
import { SettingsGearIcon } from "@/components/icons/settings-icon";
import { UsersIcon } from "@/components/icons/user-icon";
import { WithDrawIcon } from "@/components/icons/withdraw-icon";
import {
  IconCoins,
  IconExchange,
  IconHome,
  IconNews,
  IconStar,
} from "@tabler/icons-react";

// Define the types for the navigation items
export interface NavItem {
  title: string;
  url: string;
  isActive?: boolean;
  icon?: any; // Changed from Icon to any to support our custom component
}

export interface NavGroup {
  title: string;
  url: string;
  items: NavItem[];
}

// Export the navigation data so it can be accessed by other components
export const navigationData: NavGroup[] = [
  {
    title: "Dashboard",
    url: "#",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: DashboardIcon,
      },
      {
        title: "Notifications",
        url: "/admin/notifications",
        icon: NotificationIcon,
      },
      {
        title: "User Management",
        url: "/admin/users",
        icon: UsersIcon,
      },
      {
        title: "Activity Log",
        url: "/admin/activity",
        icon: ActivityIcon,
      },
    ],
  },
  {
    title: "KOR_Coins",
    url: "#",
    items: [
      {
        title: "KOR_Coins",
        url: "/admin/kor-coins",
        icon: IconCoins,
      },
      {
        title: "Deposit Management",
        url: "/admin/deposits",
        icon: DepositIcon,
      },
      {
        title: "Withdraw Management",
        url: "/admin/withdraws",
        icon: WithDrawIcon,
      },
      {
        title: "Activity Points",
        url: "/admin/activity-points",
        icon: IconStar,
      },
      {
        title: "Usage History",
        url: "/admin/usage-history",
        icon: HistoryIcon,
      },
    ],
  },
  {
    title: "Platform",
    url: "#",
    items: [
      {
        title: "UID Management",
        url: "/admin/uid-management",
        icon: FingerprintIcon,
      },
      {
        title: "Exchage UID Management",
        url: "/admin/exchange-uid-management",
        icon: IconExchange,
      },
      {
        title: "Manage Posts",
        url: "/admin/manage-posts",
        icon: IconNews,
      },
      {
        title: "URL Management",
        url: "/admin/url-management",
        icon: LinkIcon,
      },
      {
        title: "Administration Notes",
        url: "/admin/administration-notes",
        icon: FilePenLineIcon,
      },
      {
        title: "Administration Settings",
        url: "/admin/administration-settings",
        icon: SettingsGearIcon,
      },
    ],
  },
];

// Define the types for the secondary navigation items
export interface SecondaryNavItem {
  title: string;
  url: string;
  icon: any; // Changed from Icon to any to support our custom component
}

export const secondaryItems: SecondaryNavItem[] = [
  {
    title: "Go back to Main Page",
    url: "/",
    icon: IconHome,
  },
];

// Function to get the title for the current path
export function getCurrentPageTitle(pathname: string): string {
  if (!navigationData) return "Dashboard";

  for (const group of navigationData) {
    for (const item of group.items) {
      if (item.url === pathname) {
        return item.title;
      }
    }
  }

  // Default title if no match is found
  return "Dashboard";
}
