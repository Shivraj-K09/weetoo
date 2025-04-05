"use client";

import { useState } from "react";
import {
  Bell,
  Coins,
  Users,
  BarChart2,
  Settings,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample notification data
const notificationData = {
  all: [
    {
      id: "1",
      category: "system",
      title: "System Maintenance",
      description:
        "Scheduled maintenance will occur on July 5th from 2:00 AM to 4:00 AM UTC.",
      date: "2024-06-30T10:15:00",
      status: "unread",
      priority: "high",
    },
    {
      id: "2",
      category: "korCoin",
      title: "Large Deposit Detected",
      description:
        "A deposit of 1,500,000 KOR has been made by user Kim Min-ji.",
      date: "2024-06-29T15:30:00",
      status: "read",
      priority: "medium",
      type: "deposit",
      user: "Kim Min-ji",
      amount: 1500000,
      requiresApproval: true,
      approved: false,
    },
    {
      id: "3",
      category: "user",
      title: "New User Registration",
      description: "10 new users have registered in the last hour.",
      date: "2024-06-29T12:45:00",
      status: "unread",
      priority: "medium",
    },
    {
      id: "4",
      category: "report",
      title: "Monthly Report Available",
      description: "The June 2024 activity report is now available for review.",
      date: "2024-06-28T09:20:00",
      status: "read",
      priority: "low",
    },
    {
      id: "5",
      category: "system",
      title: "Security Update",
      description:
        "A security patch has been applied to the authentication system.",
      date: "2024-06-27T14:10:00",
      status: "unread",
      priority: "high",
    },
    {
      id: "6",
      category: "korCoin",
      title: "Withdrawal Request",
      description:
        "User Park Ji-sung has requested a withdrawal of 750,000 KOR.",
      date: "2024-06-26T11:05:00",
      status: "unread",
      priority: "high",
      type: "withdrawal",
      user: "Park Ji-sung",
      amount: 750000,
      requiresApproval: true,
      approved: false,
    },
  ],
  korCoin: [
    {
      id: "2",
      category: "korCoin",
      title: "Large Deposit Detected",
      description:
        "A deposit of 1,500,000 KOR has been made by user Kim Min-ji.",
      date: "2024-06-29T15:30:00",
      status: "read",
      priority: "medium",
      type: "deposit",
      user: "Kim Min-ji",
      amount: 1500000,
      requiresApproval: true,
      approved: false,
    },
    {
      id: "6",
      category: "korCoin",
      title: "Withdrawal Request",
      description:
        "User Park Ji-sung has requested a withdrawal of 750,000 KOR.",
      date: "2024-06-26T11:05:00",
      status: "unread",
      priority: "high",
      type: "withdrawal",
      user: "Park Ji-sung",
      amount: 750000,
      requiresApproval: true,
      approved: false,
    },
    {
      id: "7",
      category: "korCoin",
      title: "Transaction Volume Alert",
      description:
        "Transaction volume has increased by 25% in the last 24 hours.",
      date: "2024-06-25T16:40:00",
      status: "unread",
      priority: "medium",
    },
    {
      id: "13",
      category: "korCoin",
      title: "Deposit Approved",
      description: "A deposit of 500,000 KOR by Lee Soo-jin has been approved.",
      date: "2024-06-24T13:20:00",
      status: "read",
      priority: "low",
      type: "deposit",
      user: "Lee Soo-jin",
      amount: 500000,
      requiresApproval: false,
      approved: true,
    },
    {
      id: "14",
      category: "korCoin",
      title: "Withdrawal Rejected",
      description:
        "A withdrawal request of 2,000,000 KOR by Choi Woo-shik has been rejected.",
      date: "2024-06-23T09:15:00",
      status: "read",
      priority: "medium",
      type: "withdrawal",
      user: "Choi Woo-shik",
      amount: 2000000,
      requiresApproval: false,
      approved: false,
    },
  ],
  user: [
    {
      id: "3",
      category: "user",
      title: "New User Registration",
      description: "10 new users have registered in the last hour.",
      date: "2024-06-29T12:45:00",
      status: "unread",
      priority: "medium",
    },
    {
      id: "8",
      category: "user",
      title: "User Verification Required",
      description: "5 users are awaiting verification approval.",
      date: "2024-06-24T10:30:00",
      status: "read",
      priority: "high",
    },
    {
      id: "9",
      category: "user",
      title: "Account Lockout",
      description:
        "User Lee Min-ho's account has been locked due to multiple failed login attempts.",
      date: "2024-06-23T13:15:00",
      status: "unread",
      priority: "high",
    },
  ],
  report: [
    {
      id: "4",
      category: "report",
      title: "Monthly Report Available",
      description: "The June 2024 activity report is now available for review.",
      date: "2024-06-28T09:20:00",
      status: "read",
      priority: "low",
    },
    {
      id: "10",
      category: "report",
      title: "Weekly Analytics Update",
      description: "User engagement has increased by 15% this week.",
      date: "2024-06-22T15:50:00",
      status: "unread",
      priority: "medium",
    },
    {
      id: "11",
      category: "report",
      title: "Audit Report Completed",
      description:
        "The quarterly audit report has been completed and is ready for review.",
      date: "2024-06-21T11:25:00",
      status: "read",
      priority: "medium",
    },
  ],
  system: [
    {
      id: "1",
      category: "system",
      title: "System Maintenance",
      description:
        "Scheduled maintenance will occur on July 5th from 2:00 AM to 4:00 AM UTC.",
      date: "2024-06-30T10:15:00",
      status: "unread",
      priority: "high",
    },
    {
      id: "5",
      category: "system",
      title: "Security Update",
      description:
        "A security patch has been applied to the authentication system.",
      date: "2024-06-27T14:10:00",
      status: "unread",
      priority: "high",
    },
    {
      id: "12",
      category: "system",
      title: "Database Optimization",
      description:
        "Database optimization has been completed. System performance has improved by 20%.",
      date: "2024-06-20T08:35:00",
      status: "read",
      priority: "medium",
    },
  ],
};

// Format date
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 24) {
    return `Today, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffInHours < 48) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Format amount
function formatAmount(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount);
}

// Get icon for notification category
function getCategoryIcon(category: string) {
  switch (category) {
    case "korCoin":
      return <Coins className="h-4 w-4" />;
    case "user":
      return <Users className="h-4 w-4" />;
    case "report":
      return <BarChart2 className="h-4 w-4" />;
    case "system":
      return <Settings className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

interface NotificationProps {
  searchTerm: string;
}

export function Notification({ searchTerm }: NotificationProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Filter notifications based on search
  const filteredNotifications = (
    Object.keys(notificationData) as (keyof typeof notificationData)[]
  ).reduce((acc, key) => {
    acc[key] = notificationData[key].filter(
      (notification) =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    return acc;
  }, {} as typeof notificationData);

  // Count unread notifications by category
  const unreadCounts = {
    all: filteredNotifications.all.filter((n) => n.status === "unread").length,
    korCoin: filteredNotifications.korCoin.filter((n) => n.status === "unread")
      .length,
    user: filteredNotifications.user.filter((n) => n.status === "unread")
      .length,
    report: filteredNotifications.report.filter((n) => n.status === "unread")
      .length,
    system: filteredNotifications.system.filter((n) => n.status === "unread")
      .length,
  };

  return (
    <Tabs
      defaultValue="all"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="border rounded-lg">
        <TabsList className="h-auto rounded-none border-b bg-transparent p-0 w-full justify-start">
          <TabsTrigger
            value="all"
            className="data-[state=active]:after:bg-primary relative rounded-none py-3 -mb-0.5 px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span>All</span>
            {unreadCounts.all > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {unreadCounts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="korCoin"
            className="data-[state=active]:after:bg-primary relative rounded-none py-3 -mb-0.5 px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <Coins className="h-4 w-4" />
            <span>KOR_Coin</span>
            {unreadCounts.korCoin > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {unreadCounts.korCoin}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="user"
            className="data-[state=active]:after:bg-primary relative rounded-none py-3 -mb-0.5 px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
            {unreadCounts.user > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {unreadCounts.user}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="report"
            className="data-[state=active]:after:bg-primary relative rounded-none py-3 -mb-0.5 px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <BarChart2 className="h-4 w-4" />
            <span>Reports</span>
            {unreadCounts.report > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {unreadCounts.report}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="data-[state=active]:after:bg-primary relative rounded-none py-3 -mb-0.5 px-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none flex items-center gap-2 cursor-pointer"
          >
            <Settings className="h-4 w-4" />
            <span>System</span>
            {unreadCounts.system > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                {unreadCounts.system}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.keys(filteredNotifications).map((category) => (
          <TabsContent key={category} value={category} className="p-0 m-0">
            {filteredNotifications[
              category as keyof typeof filteredNotifications
            ].length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h2 className="text-lg font-medium mb-1">No notifications</h2>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? "No notifications match your search criteria"
                    : "You're all caught up!"}
                </p>
              </div>
            ) : (
              <div>
                {filteredNotifications[
                  category as keyof typeof filteredNotifications
                ].map((notification: any) => (
                  <div
                    key={notification.id}
                    className="border-b last:border-b-0"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {notification.status === "unread" && (
                            <div className="mt-1.5">
                              <div className="h-2 w-2 rounded-full bg-primary"></div>
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`text-sm font-medium`}>
                                {notification.title}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  {getCategoryIcon(notification.category)}
                                  <span className="capitalize">
                                    {notification.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.description}
                            </p>

                            {/* Show transaction details for KOR_Coin deposits and withdrawals */}
                            {notification.category === "korCoin" &&
                              notification.type && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-block px-2 py-0.5 bg-muted rounded-md capitalize">
                                      {notification.type}
                                    </span>
                                    <span>•</span>
                                    <span>User: {notification.user}</span>
                                    <span>•</span>
                                    <span>
                                      Amount:{" "}
                                      {formatAmount(notification.amount)} KOR
                                    </span>
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground">
                            {formatDate(notification.date)}
                          </div>

                          {/* Standard actions */}
                          {(!notification.category ||
                            notification.category !== "korCoin" ||
                            !notification.requiresApproval) && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shadow-none cursor-pointer"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="sr-only">View</span>
                              </Button>
                              {notification.status === "unread" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  <span className="sr-only">Mark as read</span>
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Approval actions for KOR_Coin transactions */}
                          {notification.category === "korCoin" &&
                            notification.requiresApproval &&
                            !notification.approved && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs shadow-none cursor-pointer"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs shadow-none cursor-pointer"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
