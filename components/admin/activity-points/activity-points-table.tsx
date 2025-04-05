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

// Sample activity points data
const activityPointsData = [
  {
    id: "ACT-24060501",
    user: {
      name: "Kim Min-ji",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060501",
    },
    points: 50,
    activityType: "post",
    activityTypeLabel: "Post Creation",
    content: "Created a new post about cryptocurrency trends",
    date: "2024-06-30T09:15:00",
  },
  {
    id: "ACT-24060502",
    user: {
      name: "Park Ji-sung",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060502",
    },
    points: 10,
    activityType: "comment",
    activityTypeLabel: "Comment",
    content: "Commented on a trending post about market analysis",
    date: "2024-06-29T14:22:00",
  },
  {
    id: "ACT-24060503",
    user: {
      name: "Lee Soo-jin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060503",
    },
    points: 5,
    activityType: "like",
    activityTypeLabel: "Like",
    content: "Liked a post about investment strategies",
    date: "2024-06-29T11:05:00",
  },
  {
    id: "ACT-24060504",
    user: {
      name: "Choi Woo-shik",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060504",
    },
    points: 20,
    activityType: "share",
    activityTypeLabel: "Share",
    content: "Shared a post about blockchain technology",
    date: "2024-06-28T16:48:00",
  },
  {
    id: "ACT-24060505",
    user: {
      name: "Kang Hye-jung",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060505",
    },
    points: 15,
    activityType: "login",
    activityTypeLabel: "Login Bonus",
    content: "Daily login bonus",
    date: "2024-06-28T10:30:00",
  },
  {
    id: "ACT-24060506",
    user: {
      name: "Jung Ho-yeon",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060506",
    },
    points: 100,
    activityType: "referral",
    activityTypeLabel: "Referral",
    content: "Referred a new user: Bae Suzy",
    date: "2024-06-27T15:40:00",
  },
  {
    id: "ACT-24060507",
    user: {
      name: "Bae Suzy",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060507",
    },
    points: 75,
    activityType: "content",
    activityTypeLabel: "Content Creation",
    content: "Created a detailed analysis article on market trends",
    date: "2024-06-27T13:25:00",
  },
  {
    id: "ACT-24060508",
    user: {
      name: "Gong Yoo",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060508",
    },
    points: 5,
    activityType: "checkin",
    activityTypeLabel: "Daily Check-in",
    content: "Checked in to the platform",
    date: "2024-06-26T10:15:00",
  },
  {
    id: "ACT-24060509",
    user: {
      name: "Son Ye-jin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060509",
    },
    points: 30,
    activityType: "post",
    activityTypeLabel: "Post Creation",
    content: "Created a new post about trading strategies",
    date: "2024-06-25T16:20:00",
  },
  {
    id: "ACT-24060510",
    user: {
      name: "Hyun Bin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060510",
    },
    points: 25,
    activityType: "comment",
    activityTypeLabel: "Comment",
    content: "Provided detailed feedback on a technical analysis post",
    date: "2024-06-25T11:45:00",
  },
];

export type ActivityPoint = (typeof activityPointsData)[0];

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
    { id: "date", desc: true },
  ]);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityPoint | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

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
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, []);

  // Get activity type badge color
  const getActivityTypeBadgeClass = useCallback((activityType: string) => {
    switch (activityType) {
      case "post":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/20";
      case "comment":
        return "bg-green-50 text-green-700 dark:bg-green-900/20";
      case "like":
        return "bg-pink-50 text-pink-700 dark:bg-pink-900/20";
      case "share":
        return "bg-purple-50 text-purple-700 dark:bg-purple-900/20";
      case "login":
        return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20";
      case "referral":
        return "bg-orange-50 text-orange-700 dark:bg-orange-900/20";
      case "content":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20";
      case "checkin":
        return "bg-teal-50 text-teal-700 dark:bg-teal-900/20";
      default:
        return "bg-gray-50 text-gray-700 dark:bg-gray-900/20";
    }
  }, []);

  const columns = useMemo<ColumnDef<ActivityPoint>[]>(
    () => [
      {
        accessorKey: "id",
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
          <div className="font-mono text-sm">{row.getValue("id")}</div>
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
          const user = row.getValue("user") as {
            name: string;
            avatar: string;
            uid: string;
          };
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.uid}</div>
              </div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const userA = rowA.getValue("user") as { name: string };
          const userB = rowB.getValue("user") as { name: string };
          return userA.name.localeCompare(userB.name);
        },
      },
      {
        accessorKey: "points",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Earned Points
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const points = row.getValue("points") as number;
          return <div className="font-medium">{points} points</div>;
        },
      },
      {
        accessorKey: "activityType",
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
          const activityType = row.getValue("activityType") as string;
          const activityTypeLabel = row.original.activityTypeLabel;
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
          const content = row.getValue("content") as string;
          return <div className="max-w-xs truncate">{content}</div>;
        },
      },
      {
        accessorKey: "date",
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
          const date = formatDate(row.getValue("date"));
          const time = formatTime(row.getValue("date"));
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
    [formatDate, formatTime, getInitials, getActivityTypeBadgeClass]
  );

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return activityPointsData.filter((activity) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          activity.id.toLowerCase().includes(searchLower) ||
          activity.user.name.toLowerCase().includes(searchLower) ||
          activity.user.uid.toLowerCase().includes(searchLower) ||
          activity.activityTypeLabel.toLowerCase().includes(searchLower) ||
          activity.content.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Activity type filter
      if (
        filters.activityType !== "all" &&
        activity.activityType !== filters.activityType
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const activityDate = new Date(activity.date);
        const startOfDay = new Date(filters.dateRange.from);
        startOfDay.setHours(0, 0, 0, 0);

        if (activityDate < startOfDay) {
          return false;
        }
      }

      if (filters.dateRange.to) {
        const activityDate = new Date(activity.date);
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);

        if (activityDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, filters]);

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
