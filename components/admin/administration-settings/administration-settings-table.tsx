"use client";

import { useState } from "react";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateAdminDialog } from "./create-admin-dialog";
import { EditIpManagementDialog } from "./edit-ip-management-dialog";
import { DeleteAdminDialog } from "./delete-admin-dialog";
import { EditAdminDialog } from "./edit-admin-dialog";

// Mock data for administrators
const mockAdmins = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    level: "Super Admin",
    situation: "Active",
    lastLogin: "2023-04-05T14:30:00Z",
    allowedIps: ["192.168.1.1", "10.0.0.1"],
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    level: "Admin",
    situation: "Active",
    lastLogin: "2023-04-05T10:15:00Z",
    allowedIps: ["192.168.1.2"],
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    level: "Moderator",
    situation: "Inactive",
    lastLogin: "2023-04-01T09:45:00Z",
    allowedIps: ["192.168.1.3", "10.0.0.3", "172.16.0.1"],
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    level: "Admin",
    situation: "Active",
    lastLogin: "2023-04-04T16:20:00Z",
    allowedIps: ["192.168.1.4"],
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    level: "Moderator",
    situation: "Active",
    lastLogin: "2023-04-03T11:10:00Z",
    allowedIps: ["192.168.1.5", "10.0.0.5"],
  },
];

export function AdministrationSettingsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editIpDialogOpen, setEditIpDialogOpen] = useState(false);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);

  // Filter admins based on search query and level filter
  const filteredAdmins = mockAdmins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.allowedIps.some((ip) => ip.includes(searchQuery));

    const matchesLevel = levelFilter === "all" || admin.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const handleEditAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setEditAdminDialogOpen(true);
  };

  const handleEditIp = (admin: any) => {
    setSelectedAdmin(admin);
    setEditIpDialogOpen(true);
  };

  const handleDeleteAdmin = (admin: any) => {
    setSelectedAdmin(admin);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "Super Admin":
        return "destructive";
      case "Admin":
        return "default";
      case "Moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getSituationBadgeVariant = (situation: string) => {
    switch (situation) {
      case "Active":
        return "default";
      case "Inactive":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center space-x-2">
            <div className="relative flex w-full items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-9"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Admin
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Situation</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Allowed IPs</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No administrators found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeVariant(admin.level)}>
                        {admin.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getSituationBadgeVariant(admin.situation)}
                      >
                        {admin.situation}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(admin.lastLogin)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {admin.allowedIps.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditAdmin(admin)}
                          >
                            Edit Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditIp(admin)}>
                            Edit IP Management
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteAdmin(admin)}
                          >
                            Delete Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <CreateAdminDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {selectedAdmin && (
        <>
          <EditAdminDialog
            admin={selectedAdmin}
            open={editAdminDialogOpen}
            onOpenChange={setEditAdminDialogOpen}
          />
          <EditIpManagementDialog
            admin={selectedAdmin}
            open={editIpDialogOpen}
            onOpenChange={setEditIpDialogOpen}
          />
          <DeleteAdminDialog
            admin={selectedAdmin}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
          />
        </>
      )}
    </>
  );
}
