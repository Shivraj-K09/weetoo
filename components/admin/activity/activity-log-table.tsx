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
import {
  ArrowUpDown,
  AlertTriangle,
  Info,
  AlertCircle,
  ClipboardList,
  Cpu,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

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
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  action_label: string;
  admin_id: string | null;
  target: string;
  details: string;
  severity: string;
  target_id?: string;
  target_type?: string;
  admin?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

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
  const [activityData, setActivityData] = useState<ActivityLog[]>([]);
  const [filteredData, setFilteredData] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setAdminUsers] = useState<
    { id: string; name: string; avatar_url: string | null }[]
  >([]);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);

  // Fetch admin users for filtering
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, first_name, last_name, avatar_url")
          .or("role.eq.admin,role.eq.super_admin");

        if (error) {
          console.error("Error fetching admin users:", error);
          return;
        }

        const formattedAdmins = data.map((user) => ({
          id: user.id,
          name:
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            "Unknown User",
          avatar_url: user.avatar_url,
        }));

        setAdminUsers(formattedAdmins);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  // Check if filters are applied
  useEffect(() => {
    const isFiltered =
      filters.action !== "all" ||
      filters.admin !== "all" ||
      filters.severity !== "all" ||
      filters.timeRange !== "all" ||
      searchTerm.trim() !== "";

    setHasAppliedFilters(isFiltered);
  }, [filters, searchTerm]);

  // Fetch activity log data
  useEffect(() => {
    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        console.log("Fetching activity log with filters:", filters);

        // Build query parameters
        const params = new URLSearchParams();
        if (filters.action !== "all") params.append("action", filters.action);
        if (filters.admin !== "all") params.append("admin", filters.admin);
        if (filters.severity !== "all")
          params.append("severity", filters.severity);
        if (filters.timeRange !== "all")
          params.append("timeRange", filters.timeRange);
        if (searchTerm) params.append("searchTerm", searchTerm);

        const response = await fetch(
          `/api/admin/activity-log?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched activity log data:", data);
        setActivityData(data);
        setFilteredData(data);
      } catch (error) {
        console.error("Error fetching activity log:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, [searchTerm, filters]);

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
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return (first + last).toUpperCase();
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
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
    if (action === "post_auto_approve") {
      return "bg-purple-50 text-purple-700 dark:bg-purple-900/20";
    } else if (
      action.includes("user_create") ||
      action.includes("post_approve") ||
      action.includes("post_show")
    ) {
      return "bg-green-50 text-green-700 dark:bg-green-900/20";
    } else if (
      action.includes("user_update") ||
      action.includes("settings_change") ||
      action.includes("admin_note_update") ||
      action.includes("post_hide")
    ) {
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
    } else if (
      action.includes("user_warning") ||
      action.includes("admin_note_create")
    ) {
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20";
    } else if (
      action.includes("user_suspend") ||
      action.includes("post_reject")
    ) {
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/20";
    } else if (
      action.includes("user_delete") ||
      action.includes("post_delete") ||
      action.includes("admin_note_delete")
    ) {
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
        const actionLabel = row.original.action_label;
        return (
          <Badge variant="outline" className={`${getActionBadgeClass(action)}`}>
            {actionLabel}
          </Badge>
        );
      },
    },
    {
      accessorKey: "admin_id",
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
      cell: ({ row }) => {
        const admin = row.original.admin;
        const adminId = row.original.admin_id;

        // Check if this is a system action (null admin_id)
        if (adminId === null) {
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 bg-slate-200 dark:bg-slate-700">
                <AvatarImage src="/abstract-network.png" alt="System" />
                <AvatarFallback>
                  <Cpu className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <div className="font-medium text-slate-600 dark:text-slate-300">
                System
              </div>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage
                src={admin?.avatar_url || "/placeholder.svg?height=24&width=24"}
                alt={
                  admin
                    ? getFullName(admin.first_name, admin.last_name)
                    : "Unknown"
                }
              />
              <AvatarFallback>
                {admin ? getInitials(admin.first_name, admin.last_name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">
              {admin
                ? getFullName(admin.first_name, admin.last_name)
                : "Unknown Admin"}
            </div>
          </div>
        );
      },
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
      cell: ({ row }) => {
        const target = row.getValue("target") as string;
        return <div>{target}</div>;
      },
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
            className={`flex items-center gap-1 capitalize ${getSeverityBadgeClass(severity)}`}
          >
            {getSeverityIcon(severity)}
            {severity}
          </Badge>
        );
      },
    },
  ];

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

  // Render empty state when there's no data
  const renderEmptyState = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (activityData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-64">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No activity logs found</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                There are no admin activities recorded yet.
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredData.length === 0 && hasAppliedFilters) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-64">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No matching activities</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                No activities match your current filters.
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return null;
  };

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
            {renderEmptyState() ||
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
              ))}
          </TableBody>
        </Table>
      </div>
      {activityData.length > 0 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {activityData.length}{" "}
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
      )}
    </>
  );
}
