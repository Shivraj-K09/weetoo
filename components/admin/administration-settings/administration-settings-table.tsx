"use client";

import { useState, useEffect } from "react";
import { Search, MoreHorizontal, Eye, Edit } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EditAdminDialog } from "./edit-admin-dialog";
import { ViewAdminDialog } from "./view-admin-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Admin {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  status: string;
  updated_at: string;
  last_login?: string;
}

export function AdministrationSettingsTable() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editAdminDialogOpen, setEditAdminDialogOpen] = useState(false);
  const [viewAdminDialogOpen, setViewAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

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

  // Fetch admins from Supabase
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        // Only fetch users with admin or super_admin roles
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .or("role.eq.admin,role.eq.super_admin");

        if (error) {
          console.error("Error fetching admins:", error);
          return;
        }

        const formattedAdmins = data.map((user) => ({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: user.status || "Active",
          updated_at: user.updated_at,
          last_login: user.last_login || user.updated_at,
        }));

        setAdmins(formattedAdmins);
        setFilteredAdmins(formattedAdmins);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Filter admins based on search query and level filter
  useEffect(() => {
    let filtered = [...admins];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((admin) => {
        const fullName =
          `${admin.first_name || ""} ${admin.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(query) || admin.email.toLowerCase().includes(query)
        );
      });
    }

    // Apply level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((admin) => admin.role === levelFilter);
    }

    setFilteredAdmins(filtered);
  }, [searchQuery, levelFilter, admins]);

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditAdminDialogOpen(true);
  };

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setViewAdminDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "outline";
    }
  };

  const getSituationBadgeVariant = (situation: string) => {
    switch (situation.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const refreshAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or("role.eq.admin,role.eq.super_admin");

      if (error) {
        console.error("Error fetching admins:", error);
        return;
      }

      const formattedAdmins = data.map((user) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        status: user.status || "Active",
        updated_at: user.updated_at,
        last_login: user.last_login || user.updated_at,
      }));

      setAdmins(formattedAdmins);

      // Reapply current filters
      let filtered = [...formattedAdmins];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((admin) => {
          const fullName =
            `${admin.first_name || ""} ${admin.last_name || ""}`.toLowerCase();
          return (
            fullName.includes(query) ||
            admin.email.toLowerCase().includes(query)
          );
        });
      }

      if (levelFilter !== "all") {
        filtered = filtered.filter((admin) => admin.role === levelFilter);
      }

      setFilteredAdmins(filtered);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
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
                placeholder="Search by name or email..."
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
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading administrators...
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No administrators found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {getFullName(admin.first_name, admin.last_name)}
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={getLevelBadgeVariant(admin.role)}>
                        {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSituationBadgeVariant(admin.status)}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(admin.last_login || admin.updated_at)}
                    </TableCell>
                    <TableCell>
                      {(currentUserRole === "admin" ||
                        currentUserRole === "super_admin") && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 cursor-pointer"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewAdmin(admin)}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {currentUserRole === "super_admin" && (
                              <DropdownMenuItem
                                onClick={() => handleEditAdmin(admin)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Admin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedAdmin && (
        <>
          <ViewAdminDialog
            admin={selectedAdmin}
            open={viewAdminDialogOpen}
            onOpenChange={setViewAdminDialogOpen}
          />
          <EditAdminDialog
            admin={selectedAdmin}
            open={editAdminDialogOpen}
            onOpenChange={setEditAdminDialogOpen}
            onAdminUpdated={refreshAdmins}
          />
        </>
      )}
    </>
  );
}
