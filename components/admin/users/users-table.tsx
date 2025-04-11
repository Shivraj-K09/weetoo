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

import { supabase } from "@/lib/supabase/client";
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

export interface User {
  id: string;
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  provider_type: string | null;
  created_at: string;
  updated_at: string;
  kor_coins: number;
  naver_id: string | null;
  role: string;
  status: "Active" | "Suspended" | "Inactive";
  warnings: number;
  last_login?: string;
}

export function UserTable({ searchTerm }: { searchTerm: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [, setCurrentUserRole] = useState<string | null>(null);

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("users").select("*");

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }

        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName =
        `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const uid = (user.uid || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        uid.includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Function to refresh users data
  const refreshUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      setUsers(data || []);
      // Apply current search filter to the new data
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = (data || []).filter((user) => {
          const fullName =
            `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
          const email = (user.email || "").toLowerCase();
          const id = (user.id || "").toLowerCase();

          return (
            fullName.includes(searchLower) ||
            email.includes(searchLower) ||
            id.includes(searchLower)
          );
        });
        setFilteredUsers(filtered);
      } else {
        setFilteredUsers(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date to a readable format based on user's locale
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Format time to a readable format based on user's locale
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language, {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
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
      cell: ({ row }) => {
        const user = row.original;
        const fullName = getFullName(user.first_name, user.last_name);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.avatar_url || "/placeholder.svg?height=40&width=40"}
                alt={fullName}
              />
              <AvatarFallback>
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium">{fullName}</div>
          </div>
        );
      },
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
        const status =
          (row.getValue("status") as string)?.toLowerCase() || "active";
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
      accessorKey: "kor_coins",
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
        const amount = row.getValue("kor_coins") as number;
        return <div className="font-medium">{formatAmount(amount)}</div>;
      },
    },
    {
      accessorKey: "created_at",
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
        return <div>{formatDate(row.getValue("created_at"))}</div>;
      },
    },
    {
      accessorKey: "last_login",
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
        const lastLogin = row.original.last_login || row.original.updated_at;
        const date = formatDate(lastLogin);
        const time = formatTime(lastLogin);
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
    data: filteredUsers,
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
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
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
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
            onUserUpdated={refreshUsers}
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
            onUserUpdated={refreshUsers}
          />

          <SuspendAccountDialog
            user={selectedUser}
            open={suspendDialogOpen}
            onOpenChange={setSuspendDialogOpen}
            onUserUpdated={refreshUsers}
          />
        </>
      )}
    </>
  );
}
