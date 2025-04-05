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
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { WithdrawDetailsDialog } from "./withdraw-details-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "react-day-picker";

// Sample withdraw data
const withdrawData = [
  {
    id: "WDR-24060501",
    user: {
      name: "Kim Min-ji",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060501",
    },
    amount: 150000,
    withdrawalMethod: "Bank Transfer",
    situation: "approved",
    date: "2024-06-30T08:15:00",
    approvedBy: "Admin 1",
  },
  {
    id: "WDR-24060502",
    user: {
      name: "Park Ji-sung",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060502",
    },
    amount: 300000,
    withdrawalMethod: "Bank Transfer",
    situation: "pending",
    date: "2024-06-29T13:22:00",
    approvedBy: null,
  },
  {
    id: "WDR-24060503",
    user: {
      name: "Lee Soo-jin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060503",
    },
    amount: 750000,
    withdrawalMethod: "Bank Transfer",
    situation: "approved",
    date: "2024-06-29T10:05:00",
    approvedBy: "Admin 2",
  },
  {
    id: "WDR-24060504",
    user: {
      name: "Choi Woo-shik",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060504",
    },
    amount: 50000,
    withdrawalMethod: "Mobile Wallet",
    situation: "rejected",
    date: "2024-06-28T15:48:00",
    approvedBy: "Admin 3",
  },
  {
    id: "WDR-24060505",
    user: {
      name: "Kang Hye-jung",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060505",
    },
    amount: 450000,
    withdrawalMethod: "Bank Transfer",
    situation: "pending",
    date: "2024-06-28T09:30:00",
    approvedBy: null,
  },
  {
    id: "WDR-24060506",
    user: {
      name: "Jung Ho-yeon",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060506",
    },
    amount: 200000,
    withdrawalMethod: "Mobile Wallet",
    situation: "approved",
    date: "2024-06-27T14:40:00",
    approvedBy: "Admin 1",
  },
  {
    id: "WDR-24060507",
    user: {
      name: "Bae Suzy",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060507",
    },
    amount: 100000,
    withdrawalMethod: "Mobile Wallet",
    situation: "approved",
    date: "2024-06-27T12:25:00",
    approvedBy: "Admin 2",
  },
  {
    id: "WDR-24060508",
    user: {
      name: "Gong Yoo",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060508",
    },
    amount: 600000,
    withdrawalMethod: "Bank Transfer",
    situation: "pending",
    date: "2024-06-26T09:15:00",
    approvedBy: null,
  },
  {
    id: "WDR-24060509",
    user: {
      name: "Son Ye-jin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060509",
    },
    amount: 350000,
    withdrawalMethod: "Bank Transfer",
    situation: "approved",
    date: "2024-06-25T15:20:00",
    approvedBy: "Admin 3",
  },
  {
    id: "WDR-24060510",
    user: {
      name: "Hyun Bin",
      avatar: "/placeholder.svg?height=40&width=40",
      uid: "UID-24060510",
    },
    amount: 500000,
    withdrawalMethod: "Bank Transfer",
    situation: "approved",
    date: "2024-06-25T10:45:00",
    approvedBy: "Admin 1",
  },
];

export type Withdraw = (typeof withdrawData)[0];

interface WithdrawTableProps {
  searchTerm: string;
  filters: {
    status: string;
    dateRange: DateRange;
  };
}

export function WithdrawTable({ searchTerm, filters }: WithdrawTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [selectedWithdraw, setSelectedWithdraw] = useState<Withdraw | null>(
    null
  );
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

  // Format amount
  const formatAmount = useCallback((amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  }, []);

  // Get initials from name
  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, []);

  const columns = useMemo<ColumnDef<Withdraw>[]>(
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
        accessorKey: "amount",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const amount = row.getValue("amount") as number;
          return <div className="font-medium">{formatAmount(amount)} KOR</div>;
        },
      },
      {
        accessorKey: "withdrawalMethod",
        header: "Withdrawal Method",
        cell: ({ row }) => <div>{row.getValue("withdrawalMethod")}</div>,
      },
      {
        accessorKey: "situation",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("situation") as string;
          return (
            <>
              {status === "approved" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/20 flex gap-1 items-center"
                >
                  <CheckCircle className="h-3 w-3" />
                  Approved
                </Badge>
              )}
              {status === "pending" && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 flex gap-1 items-center"
                >
                  <Clock className="h-3 w-3" />
                  Pending
                </Badge>
              )}
              {status === "rejected" && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 dark:bg-red-900/20 flex gap-1 items-center"
                >
                  <XCircle className="h-3 w-3" />
                  Rejected
                </Badge>
              )}
            </>
          );
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
        accessorKey: "approvedBy",
        header: "Approved By",
        cell: ({ row }) => {
          const approvedBy = row.getValue("approvedBy") as string | null;
          return <div>{approvedBy || "-"}</div>;
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const withdraw = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 shadow-none cursor-pointer"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedWithdraw(withdraw);
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
    [formatAmount, formatDate, formatTime, getInitials]
  );

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return withdrawData.filter((withdraw) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          withdraw.id.toLowerCase().includes(searchLower) ||
          withdraw.user.name.toLowerCase().includes(searchLower) ||
          withdraw.user.uid.toLowerCase().includes(searchLower) ||
          withdraw.withdrawalMethod.toLowerCase().includes(searchLower) ||
          withdraw.situation.toLowerCase().includes(searchLower) ||
          (withdraw.approvedBy &&
            withdraw.approvedBy.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && withdraw.situation !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const withdrawDate = new Date(withdraw.date);
        const startOfDay = new Date(filters.dateRange.from);
        startOfDay.setHours(0, 0, 0, 0);

        if (withdrawDate < startOfDay) {
          return false;
        }
      }

      if (filters.dateRange.to) {
        const withdrawDate = new Date(withdraw.date);
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);

        if (withdrawDate > endOfDay) {
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

  // Clean up selected withdraw when dialog closes
  useEffect(() => {
    if (!detailsDialogOpen) {
      // Use a timeout to prevent memory leaks
      const timer = setTimeout(() => {
        setSelectedWithdraw(null);
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
            withdrawals
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
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
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Withdraw details dialog */}
      {selectedWithdraw && (
        <WithdrawDetailsDialog
          withdraw={selectedWithdraw}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}
    </>
  );
}
