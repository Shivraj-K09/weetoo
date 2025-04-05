"use client";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, AlertTriangle, Info, AlertCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Sample activity log data
const activityLogData = [
  {
    id: "1",
    timestamp: "2024-06-30T10:15:00",
    action: "user_suspend",
    actionLabel: "User Suspend",
    admin: "Admin 1",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Choi Woo-shik (UID-24060504)",
    details:
      "Suspended user account for 7 days due to multiple policy violations.",
    severity: "high",
  },
  {
    id: "2",
    timestamp: "2024-06-30T09:45:00",
    action: "transaction_approve",
    actionLabel: "Transaction Approve",
    admin: "Admin 2",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Transaction #TR-24063001",
    details: "Approved deposit of 1,500,000 KOR for user Kim Min-ji.",
    severity: "medium",
  },
  {
    id: "3",
    timestamp: "2024-06-29T16:30:00",
    action: "user_warning",
    actionLabel: "User Warning",
    admin: "Admin 1",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Park Ji-sung (UID-24060502)",
    details: "Issued warning for inappropriate content in user profile.",
    severity: "medium",
  },
  {
    id: "4",
    timestamp: "2024-06-29T14:20:00",
    action: "settings_change",
    actionLabel: "Settings Change",
    admin: "Admin 3",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "System Settings",
    details: "Updated KOR_COIN exchange rate from 1.2 to 1.25.",
    severity: "high",
  },
  {
    id: "5",
    timestamp: "2024-06-29T11:05:00",
    action: "user_create",
    actionLabel: "User Create",
    admin: "Admin 2",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Lee Soo-jin (UID-24060503)",
    details: "Created new admin user account with moderator privileges.",
    severity: "medium",
  },
  {
    id: "6",
    timestamp: "2024-06-28T15:40:00",
    action: "transaction_reject",
    actionLabel: "Transaction Reject",
    admin: "Admin 4",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Transaction #TR-24062801",
    details:
      "Rejected withdrawal of 2,000,000 KOR for user Choi Woo-shik due to suspicious activity.",
    severity: "high",
  },
  {
    id: "7",
    timestamp: "2024-06-28T13:15:00",
    action: "user_update",
    actionLabel: "User Update",
    admin: "Admin 1",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Kang Hye-jung (UID-24060505)",
    details:
      "Updated user profile information and verified identity documents.",
    severity: "low",
  },
  {
    id: "8",
    timestamp: "2024-06-27T16:50:00",
    action: "settings_change",
    actionLabel: "Settings Change",
    admin: "Admin 3",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Security Settings",
    details:
      "Enabled two-factor authentication requirement for all admin accounts.",
    severity: "critical",
  },
  {
    id: "9",
    timestamp: "2024-06-27T10:30:00",
    action: "user_delete",
    actionLabel: "User Delete",
    admin: "Admin 4",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Test Account (UID-24060001)",
    details: "Deleted test user account after testing completion.",
    severity: "low",
  },
  {
    id: "10",
    timestamp: "2024-06-26T14:25:00",
    action: "transaction_approve",
    actionLabel: "Transaction Approve",
    admin: "Admin 2",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Transaction #TR-24062601",
    details: "Approved withdrawal of 750,000 KOR for user Jung Ho-yeon.",
    severity: "medium",
  },
  {
    id: "11",
    timestamp: "2024-06-26T11:10:00",
    action: "user_suspend",
    actionLabel: "User Suspend",
    admin: "Admin 1",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Anonymous User (UID-24060201)",
    details:
      "Permanently suspended account for repeated terms of service violations.",
    severity: "critical",
  },
  {
    id: "12",
    timestamp: "2024-06-25T15:35:00",
    action: "settings_change",
    actionLabel: "Settings Change",
    admin: "Admin 3",
    adminAvatar: "/placeholder.svg?height=40&width=40",
    target: "Notification Settings",
    details: "Updated system notification templates for user warnings.",
    severity: "low",
  },
];

export type ActivityLog = (typeof activityLogData)[0];

interface ActivityLogTableProps {
  searchTerm: string;
  filters: {
    action: string;
    admin: string;
    severity: string;
    timeRange: string;
  };
}

export function ActivityLogTable({
  searchTerm,
  filters,
}: ActivityLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [filteredData, setFilteredData] = useState(activityLogData);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format time to a readable format
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "low":
        return <Info className="h-3 w-3" />;
      case "medium":
        return <AlertCircle className="h-3 w-3" />;
      case "high":
        return <AlertTriangle className="h-3 w-3" />;
      case "critical":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  // Get severity badge class
  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
      case "medium":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20";
      case "high":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20";
      case "critical":
        return "bg-red-50 text-red-700 dark:bg-red-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  };

  // Get action badge class
  const getActionBadgeClass = (action: string) => {
    if (
      action.includes("user_create") ||
      action.includes("transaction_approve")
    ) {
      return "bg-green-50 text-green-700 dark:bg-green-900/20";
    } else if (
      action.includes("user_update") ||
      action.includes("settings_change")
    ) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
    } else if (action.includes("user_warning")) {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20";
    } else if (
      action.includes("user_suspend") ||
      action.includes("transaction_reject")
    ) {
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/20";
    } else if (action.includes("user_delete")) {
      return "bg-red-50 text-red-700 dark:bg-red-900/20";
    } else {
      return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  };

  const columns: ColumnDef<ActivityLog>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Timestamp
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = formatDate(row.getValue("timestamp"));
        const time = formatTime(row.getValue("timestamp"));
        return (
          <div>
            <div className="font-medium">{date}</div>
            <div className="text-xs text-muted-foreground">{time}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "action",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Action
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const action = row.getValue("action") as string;
        const actionLabel = row.original.actionLabel;
        return (
          <Badge variant="outline" className={`${getActionBadgeClass(action)}`}>
            {actionLabel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "admin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Admin
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage
              src={row.original.adminAvatar}
              alt={row.getValue("admin")}
            />
            <AvatarFallback>
              {getInitials(row.getValue("admin"))}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.getValue("admin")}</div>
        </div>
      ),
    },
    {
      accessorKey: "target",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Target
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div>{row.getValue("target")}</div>,
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <div className="max-w-md">{row.getValue("details")}</div>
      ),
    },
    {
      accessorKey: "severity",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Severity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const severity = row.getValue("severity") as string;
        return (
          <Badge
            variant="outline"
            className={`flex items-center gap-1 capitalize ${getSeverityBadgeClass(
              severity
            )}`}
          >
            {getSeverityIcon(severity)}
            {severity}
          </Badge>
        );
      },
    },
  ];

  // Apply filters to data
  useEffect(() => {
    let result = [...activityLogData];

    // Apply search term filter
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.action.toLowerCase().includes(lowercasedSearch) ||
          item.actionLabel.toLowerCase().includes(lowercasedSearch) ||
          item.admin.toLowerCase().includes(lowercasedSearch) ||
          item.target.toLowerCase().includes(lowercasedSearch) ||
          item.details.toLowerCase().includes(lowercasedSearch) ||
          item.severity.toLowerCase().includes(lowercasedSearch)
      );
    }

    // Apply action filter - only if not "all"
    if (filters.action && filters.action !== "all") {
      result = result.filter((item) => item.action === filters.action);
    }

    // Apply admin filter - only if not "all"
    if (filters.admin && filters.admin !== "all") {
      result = result.filter((item) => item.admin === filters.admin);
    }

    // Apply severity filter - only if not "all"
    if (filters.severity && filters.severity !== "all") {
      result = result.filter((item) => item.severity === filters.severity);
    }

    // Apply time range filter - only if not "all"
    if (filters.timeRange !== "all") {
      const now = new Date();
      const startDate = new Date();

      if (filters.timeRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (filters.timeRange === "yesterday") {
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        now.setDate(now.getDate() - 1);
        now.setHours(23, 59, 59, 999);
      } else if (filters.timeRange === "week") {
        const day = startDate.getDay() || 7;
        startDate.setDate(startDate.getDate() - day + 1);
        startDate.setHours(0, 0, 0, 0);
      } else if (filters.timeRange === "month") {
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }

      result = result.filter((item) => {
        const date = new Date(item.timestamp);
        return date >= startDate && date <= now;
      });
    }

    setFilteredData(result);
  }, [searchTerm, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {activityLogData.length}{" "}
          activities
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none cursor-pointer h-10"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none cursor-pointer h-10"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
