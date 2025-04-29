"use client";

import { useState, useMemo } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Badge } from "@/components/ui/badge";

// Define types for our data
type UserData = {
  id: string;
  name: string;
  email: string;
  broadcastTime: string;
  broadcastSeconds: number;
  listenerTime: string;
  listenerSeconds: number;
  lastActive: string;
  status: string;
};

type RoomData = {
  id: string;
  name: string;
  totalBroadcastTime: string;
  totalBroadcastSeconds: number;
  totalListenerTime: string;
  totalListenerSeconds: number;
  activeUsers: number;
  lastActive: string;
};

// Sample data - would be replaced with real data from your API
const users: UserData[] = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "alex@example.com",
    broadcastTime: "42h 15m",
    broadcastSeconds: 152100,
    listenerTime: "12h 30m",
    listenerSeconds: 45000,
    lastActive: "2 hours ago",
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    broadcastTime: "38h 45m",
    broadcastSeconds: 139500,
    listenerTime: "8h 20m",
    listenerSeconds: 30000,
    lastActive: "1 day ago",
    status: "active",
  },
  {
    id: "3",
    name: "Michael Chen",
    email: "michael@example.com",
    broadcastTime: "27h 10m",
    broadcastSeconds: 97800,
    listenerTime: "15h 45m",
    listenerSeconds: 56700,
    lastActive: "3 days ago",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    broadcastTime: "24h 30m",
    broadcastSeconds: 88200,
    listenerTime: "6h 15m",
    listenerSeconds: 22500,
    lastActive: "5 hours ago",
    status: "active",
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james@example.com",
    broadcastTime: "18h 20m",
    broadcastSeconds: 66000,
    listenerTime: "9h 40m",
    listenerSeconds: 34800,
    lastActive: "2 days ago",
    status: "inactive",
  },
];

// Sample room data
const rooms: RoomData[] = [
  {
    id: "1",
    name: "Bitcoin Trading Room",
    totalBroadcastTime: "120h 45m",
    totalBroadcastSeconds: 434700,
    totalListenerTime: "350h 20m",
    totalListenerSeconds: 1261200,
    activeUsers: 24,
    lastActive: "2 hours ago",
  },
  {
    id: "2",
    name: "Forex Strategies",
    totalBroadcastTime: "95h 30m",
    totalBroadcastSeconds: 343800,
    totalListenerTime: "280h 15m",
    totalListenerSeconds: 1008900,
    activeUsers: 18,
    lastActive: "5 hours ago",
  },
  {
    id: "3",
    name: "Crypto Analysis",
    totalBroadcastTime: "85h 15m",
    totalBroadcastSeconds: 306900,
    totalListenerTime: "210h 40m",
    totalListenerSeconds: 758400,
    activeUsers: 15,
    lastActive: "1 day ago",
  },
  {
    id: "4",
    name: "Stock Market Live",
    totalBroadcastTime: "72h 50m",
    totalBroadcastSeconds: 262200,
    totalListenerTime: "190h 25m",
    totalListenerSeconds: 685500,
    activeUsers: 12,
    lastActive: "3 hours ago",
  },
  {
    id: "5",
    name: "Trading Beginners",
    totalBroadcastTime: "45h 20m",
    totalBroadcastSeconds: 163200,
    totalListenerTime: "150h 10m",
    totalListenerSeconds: 540600,
    activeUsers: 8,
    lastActive: "6 hours ago",
  },
];

interface LiveKitUsageTableProps {
  isRoomView?: boolean;
  onUserSelect?: (userId: string) => void;
}

export function LiveKitUsageTable({
  isRoomView = false,
  onUserSelect,
}: LiveKitUsageTableProps) {
  // Define columns for user view
  const userColumns = useMemo<ColumnDef<UserData>[]>(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "broadcastTime",
        header: "Broadcast Time",
        sortingFn: "basic",
      },
      {
        accessorKey: "listenerTime",
        header: "Listener Time",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge
            variant={row.original.status === "active" ? "default" : "outline"}
          >
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onUserSelect && onUserSelect(row.original.id);
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Export data
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onUserSelect]
  );

  // Define columns for room view
  const roomColumns = useMemo<ColumnDef<RoomData>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Room Name",
      },
      {
        accessorKey: "totalBroadcastTime",
        header: "Broadcast Time",
      },
      {
        accessorKey: "totalListenerTime",
        header: "Listener Time",
      },
      {
        accessorKey: "activeUsers",
        header: "Active Users",
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Export data</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  // Fixed: Use column IDs that actually exist in our column definitions
  const [userSorting, setUserSorting] = useState<SortingState>([
    {
      id: "broadcastTime", // Changed from broadcastSeconds to broadcastTime
      desc: true,
    },
  ]);

  const [roomSorting, setRoomSorting] = useState<SortingState>([
    {
      id: "totalBroadcastTime", // Changed from totalBroadcastSeconds to totalBroadcastTime
      desc: true,
    },
  ]);

  // Create separate tables for users and rooms
  const userTable = useReactTable({
    data: users,
    columns: userColumns,
    state: {
      sorting: userSorting,
    },
    onSortingChange: setUserSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const roomTable = useReactTable({
    data: rooms,
    columns: roomColumns,
    state: {
      sorting: roomSorting,
    },
    onSortingChange: setRoomSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-auto">
      {isRoomView ? (
        // Room Table
        <Table>
          <TableHeader>
            {roomTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="ml-1 h-4 w-4" />,
                        desc: <ChevronDown className="ml-1 h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {roomTable.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        // User Table
        <Table>
          <TableHeader>
            {userTable.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : ""
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: <ChevronUp className="ml-1 h-4 w-4" />,
                        desc: <ChevronDown className="ml-1 h-4 w-4" />,
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {userTable.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={
                  onUserSelect ? "cursor-pointer hover:bg-muted/50" : ""
                }
                onClick={() => onUserSelect && onUserSelect(row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
