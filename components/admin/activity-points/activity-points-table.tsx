"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityPointsDetailsDialog } from "./activity-points-details-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";
import {
  getPointTransactions,
  type PointTransaction,
} from "@/app/actions/admin-content-actions";
import { Skeleton } from "@/components/ui/skeleton";

export type ActivityPoint = PointTransaction;

interface ActivityPointsTableProps {
  searchTerm: string;
  filters: {
    activityType: string;
    dateRange: DateRange;
  };
}

export function ActivityPointsTable({
  searchTerm,
  filters,
}: ActivityPointsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityPoint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityPoint[]>([]);

  // Fetch activities on component mount
  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const data = await getPointTransactions();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Format date to a readable format
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, []);

  // Format time to a readable format
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  // Get initials from name
  const getInitials = useCallback((name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, []);

  // Get activity type badge color
  const getActivityTypeBadgeClass = useCallback((activityType: string) => {
    switch (activityType) {
      case "post_create":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
      case "comment_add":
        return "bg-green-50 text-green-700 dark:bg-green-900/20";
      case "post_like":
        return "bg-pink-50 text-pink-700 dark:bg-pink-900/20";
      case "post_share":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20";
      case "welcome_bonus":
        return "bg-amber-50 text-amber-700 dark:bg-amber-900/20";
      case "daily_login":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  }, []);

  // Get activity type label
  const getActivityTypeLabel = useCallback((activityType: string) => {
    switch (activityType) {
      case "post_create":
        return "Post Creation";
      case "comment_add":
        return "Comment";
      case "post_like":
        return "Like";
      case "post_share":
        return "Share";
      case "welcome_bonus":
        return "Welcome Bonus";
      case "daily_login":
        return "Daily Login";
      default:
        return activityType;
    }
  }, []);

  // Map transaction type to filter type
  const mapTransactionTypeToFilter = useCallback((transactionType: string) => {
    switch (transactionType) {
      case "post_create":
        return "post";
      case "comment_add":
        return "comment";
      case "post_like":
        return "like";
      case "post_share":
        return "share";
      default:
        return transactionType;
    }
  }, []);

  // Get content description from metadata
  const getContentDescription = useCallback((transaction: PointTransaction) => {
    const metadata = transaction.metadata || {};

    switch (transaction.transaction_type) {
      case "post_create":
        return `Created a post: ${metadata.post_title || "Untitled Post"}`;
      case "comment_add":
        return `Commented on: ${metadata.post_title || "Unknown Post"}`;
      case "post_like":
        return `Liked a post: ${metadata.post_title || "Unknown Post"}`;
      case "post_share":
        return `Shared a post: ${metadata.post_title || "Unknown Post"}${metadata.share_platform ? ` on ${metadata.share_platform}` : ""}`;
      case "welcome_bonus":
        return "Received welcome bonus for joining";
      case "daily_login":
        return `Daily login bonus on ${new Date(metadata.login_date).toLocaleDateString()}`;
      default:
        return "Performed an activity";
    }
  }, []);

  const columns = useMemo<ColumnDef<ActivityPoint>[]>(
    () => [
      {
        accessorKey: "act_id",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-mono text-sm">
            {row.getValue("act_id") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "user",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              User
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const transaction = row.original;
          const user = transaction.user || {
            first_name: "Unknown",
            last_name: "User",
            avatar_url: null,
            uid: "N/A",
          };

          const name =
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            "Unknown User";

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ""} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.uid || "N/A"}
                </div>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const userA = rowA.original.user;
          const userB = rowB.original.user;
          const nameA = userA
            ? `${userA.first_name || ""} ${userA.last_name || ""}`.trim()
            : "";
          const nameB = userB
            ? `${userB.first_name || ""} ${userB.last_name || ""}`.trim()
            : "";
          return nameA.localeCompare(nameB);
        },
      },
      {
        accessorKey: "exp_earned",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Earned EXP
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("exp_earned") as number;
          return <div className="font-medium">{value} EXP</div>;
        },
      },
      {
        accessorKey: "coins_earned",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Earned KOR Coins
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue("coins_earned") as number;
          return <div className="font-medium">{value} KOR</div>;
        },
      },
      {
        accessorKey: "transaction_type",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Activity Type
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const transaction = row.original;
          const activityType = transaction.transaction_type;
          const activityTypeLabel = getActivityTypeLabel(activityType);
          return (
            <Badge
              variant="outline"
              className={getActivityTypeBadgeClass(activityType)}
            >
              {activityTypeLabel}
            </Badge>
          );
        },
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => {
          const transaction = row.original;
          const content = getContentDescription(transaction);
          return <div className="max-w-xs truncate">{content}</div>;
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = formatDate(row.getValue("created_at"));
          const time = formatTime(row.getValue("created_at"));
          return (
            <div>
              <div>{date}</div>
              <div className="text-xs text-muted-foreground">{time}</div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const activity = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedActivity(activity);
                      setDetailsDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      formatDate,
      formatTime,
      getInitials,
      getActivityTypeBadgeClass,
      getActivityTypeLabel,
      getContentDescription,
    ]
  );

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return activities.filter((activity) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const userName = activity.user
          ? `${activity.user.first_name || ""} ${activity.user.last_name || ""}`
              .trim()
              .toLowerCase()
          : "";
        const userUid = activity.user?.uid?.toLowerCase() || "";
        const activityTypeLabel = getActivityTypeLabel(
          activity.transaction_type
        ).toLowerCase();
        const content = getContentDescription(activity).toLowerCase();

        const matchesSearch =
          (activity.act_id?.toLowerCase() || "").includes(searchLower) ||
          userName.includes(searchLower) ||
          userUid.includes(searchLower) ||
          activityTypeLabel.includes(searchLower) ||
          content.includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Activity type filter
      if (filters.activityType !== "all") {
        const mappedType = mapTransactionTypeToFilter(
          activity.transaction_type
        );
        if (mappedType !== filters.activityType) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from) {
        const activityDate = new Date(activity.created_at);
        const startOfDay = new Date(filters.dateRange.from);
        startOfDay.setHours(0, 0, 0, 0);

        if (activityDate < startOfDay) {
          return false;
        }
      }

      if (filters.dateRange.to) {
        const activityDate = new Date(activity.created_at);
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);

        if (activityDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [
    activities,
    searchTerm,
    filters,
    getActivityTypeLabel,
    getContentDescription,
    mapTransactionTypeToFilter,
  ]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  // Reset to first page when filters change
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchTerm, filters, table]);

  // Clean up selected activity when dialog closes
  useEffect(() => {
    if (!detailsDialogOpen) {
      // Use a timeout to prevent memory leaks
      const timer = setTimeout(() => {
        setSelectedActivity(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [detailsDialogOpen]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>
                    {typeof column.header === "string"
                      ? column.header
                      : "Column"}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-wrap items-center justify-between space-y-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
            activities
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] shadow-none cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">per page</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-10 cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="shadow-none h-10 cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Activity details dialog */}
      {selectedActivity && (
        <ActivityPointsDetailsDialog
          activity={selectedActivity}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </>
  );
}
