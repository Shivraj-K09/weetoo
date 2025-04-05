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
  Eye,
  Edit,
  MessageSquare,
  AlertTriangle,
  Ban,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { ViewUserDialog } from "./user-dialogs/view-user-dialog";
import { EditUserDialog } from "./user-dialogs/edit-user-dialog";
import { SendMessageDialog } from "./user-dialogs/send-message-dialog";
import { IssueWarningDialog } from "./user-dialogs/issue-warning-dialog";
import { SuspendAccountDialog } from "./user-dialogs/suspend-account-dialog";

// Sample user data
const userData = [
  {
    id: "1",
    name: "Kim Min-ji",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060501",
    status: "active",
    warnings: 0,
    korCoin: 250000,
    registered: "2024-01-15T08:45:00",
    lastLogin: "2024-06-30T09:15:00",
  },
  {
    id: "2",
    name: "Park Ji-sung",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060502",
    status: "active",
    warnings: 1,
    korCoin: 180000,
    registered: "2024-02-20T15:30:00",
    lastLogin: "2024-06-29T14:22:00",
  },
  {
    id: "3",
    name: "Lee Soo-jin",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060503",
    status: "pending",
    warnings: 0,
    korCoin: 0,
    registered: "2024-06-29T12:15:00",
    lastLogin: "2024-06-29T12:15:00",
  },
  {
    id: "4",
    name: "Choi Woo-shik",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060504",
    status: "suspended",
    warnings: 3,
    korCoin: 320000,
    registered: "2023-11-10T09:20:00",
    lastLogin: "2024-06-15T16:48:00",
  },
  {
    id: "5",
    name: "Kang Hye-jung",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060505",
    status: "active",
    warnings: 0,
    korCoin: 150000,
    registered: "2023-09-05T14:10:00",
    lastLogin: "2024-06-28T10:30:00",
  },
  {
    id: "6",
    name: "Jung Ho-yeon",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060506",
    status: "active",
    warnings: 2,
    korCoin: 750000,
    registered: "2023-12-12T11:05:00",
    lastLogin: "2024-06-26T11:05:00",
  },
  {
    id: "7",
    name: "Bae Suzy",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060507",
    status: "active",
    warnings: 0,
    korCoin: 420000,
    registered: "2024-03-18T13:25:00",
    lastLogin: "2024-06-27T15:40:00",
  },
  {
    id: "8",
    name: "Gong Yoo",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060508",
    status: "inactive",
    warnings: 0,
    korCoin: 180000,
    registered: "2023-08-22T10:15:00",
    lastLogin: "2024-05-10T09:30:00",
  },
  {
    id: "9",
    name: "Son Ye-jin",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060509",
    status: "active",
    warnings: 1,
    korCoin: 560000,
    registered: "2024-01-30T16:20:00",
    lastLogin: "2024-06-29T18:15:00",
  },
  {
    id: "10",
    name: "Hyun Bin",
    avatar: "/placeholder.svg?height=40&width=40",
    uid: "UID-24060510",
    status: "active",
    warnings: 0,
    korCoin: 890000,
    registered: "2023-10-15T11:45:00",
    lastLogin: "2024-06-30T08:20:00",
  },
];

export type User = (typeof userData)[0];

export function UserTable({ searchTerm }: { searchTerm: string }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);

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

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={row.original.avatar} alt={row.getValue("name")} />
            <AvatarFallback>{getInitials(row.getValue("name"))}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{row.getValue("name")}</div>
        </div>
      ),
    },
    {
      accessorKey: "uid",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            UID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("uid")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <>
            {status === "active" && (
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 dark:bg-green-900/20 flex gap-1 items-center"
              >
                <CheckCircle className="h-3 w-3" />
                Active
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
            {status === "suspended" && (
              <Badge
                variant="outline"
                className="bg-red-50 text-red-700 dark:bg-red-900/20 flex gap-1 items-center"
              >
                <Ban className="h-3 w-3" />
                Suspended
              </Badge>
            )}
            {status === "inactive" && (
              <Badge
                variant="outline"
                className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 flex gap-1 items-center"
              >
                <XCircle className="h-3 w-3" />
                Inactive
              </Badge>
            )}
          </>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "warnings",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Warnings
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const warnings = row.getValue("warnings") as number;
        return (
          <div
            className={`font-medium ${warnings > 0 ? "text-amber-600" : ""}`}
          >
            {warnings}
          </div>
        );
      },
    },
    {
      accessorKey: "korCoin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            KOR_COIN
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const amount = row.getValue("korCoin") as number;
        return <div className="font-medium">{formatAmount(amount)}</div>;
      },
    },
    {
      accessorKey: "registered",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Registered
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return <div>{formatDate(row.getValue("registered"))}</div>;
      },
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Last Login
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = formatDate(row.getValue("lastLogin"));
        const time = formatTime(row.getValue("lastLogin"));
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
        const user = row.original;

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setViewDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setEditDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setMessageDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setWarningDialogOpen(true);
                  }}
                  className="cursor-pointer text-amber-600"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Issue Warning
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedUser(user);
                    setSuspendDialogOpen(true);
                  }}
                  className="cursor-pointer text-red-600"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: userData,
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
    filterFns: {
      fuzzy: (row, columnId, value) => {
        const itemValue = String(row.getValue(columnId)).toLowerCase();
        return itemValue.includes(String(value).toLowerCase());
      },
    },
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      if (typeof value === "string") {
        return value.toLowerCase().includes(filterValue.toLowerCase());
      }
      return false;
    },
  });

  useEffect(() => {
    if (searchTerm) {
      table.setGlobalFilter(searchTerm);
    } else {
      table.setGlobalFilter("");
    }
  }, [searchTerm, table]);

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
          Showing {table.getRowModel().rows.length} of {userData.length} users
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

      {/* User action dialogs */}
      {selectedUser && (
        <>
          <ViewUserDialog
            user={selectedUser}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />

          <EditUserDialog
            user={selectedUser}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />

          <SendMessageDialog
            user={selectedUser}
            open={messageDialogOpen}
            onOpenChange={setMessageDialogOpen}
          />

          <IssueWarningDialog
            user={selectedUser}
            open={warningDialogOpen}
            onOpenChange={setWarningDialogOpen}
          />

          <SuspendAccountDialog
            user={selectedUser}
            open={suspendDialogOpen}
            onOpenChange={setSuspendDialogOpen}
          />
        </>
      )}
    </>
  );
}
