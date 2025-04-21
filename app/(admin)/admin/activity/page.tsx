"use client";

import { useState, useEffect } from "react";
import { Search, Download, Filter } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityLogTable } from "@/components/admin/activity/activity-log-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    action: "all",
    admin: "all",
    severity: "all",
    timeRange: "all",
  });
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([
    { id: "all", name: "All Admins" },
    { id: "system", name: "System" }, // Add System as an option
  ]);
  const [actionTypes, setActionTypes] = useState<
    { value: string; label: string }[]
  >([
    { value: "all", label: "All Actions" },
    { value: "post_auto_approve", label: "Post Auto-Approved" }, // Ensure this is always available
    { value: "post_approve", label: "Post Approved" },
    { value: "post_delete", label: "Post Deleted" },
    { value: "user_update", label: "User Updated" },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length;

  // Fetch admin users for filtering
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, first_name, last_name")
          .or("role.eq.admin,role.eq.super_admin");

        if (error) {
          console.error("Error fetching admin users:", error);
          return;
        }

        const formattedAdmins = [
          { id: "all", name: "All Admins" },
          { id: "system", name: "System" }, // Keep System option
          ...data.map((user) => ({
            id: user.id,
            name:
              `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
              "Unknown User",
          })),
        ];

        setAdminUsers(formattedAdmins);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchAdminUsers();
  }, []);

  // Fetch action types dynamically from the database
  useEffect(() => {
    const fetchActionTypes = async () => {
      try {
        setIsLoading(true);

        // Get distinct action types from the database
        const { data, error } = await supabase
          .from("admin_activity_log")
          .select("action, action_label")
          .order("action_label");

        if (error) {
          console.error("Error fetching action types:", error);
          return;
        }

        // Create a map to deduplicate and get unique action types
        const actionMap = new Map();
        actionMap.set("all", "All Actions");
        actionMap.set("post_auto_approve", "Post Auto-Approved"); // Ensure this is always available
        actionMap.set("post_approve", "Post Approved");
        actionMap.set("post_delete", "Post Deleted");
        actionMap.set("user_update", "User Updated");

        data.forEach((item) => {
          if (!actionMap.has(item.action)) {
            actionMap.set(item.action, item.action_label);
          }
        });

        // Convert map to array of objects
        const uniqueActions = Array.from(actionMap.entries()).map(
          ([value, label]) => ({
            value,
            label,
          })
        );

        setActionTypes(uniqueActions);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActionTypes();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      action: "all",
      admin: "all",
      severity: "all",
      timeRange: "all",
    });
  };

  // Handle CSV export
  const handleExport = async () => {
    try {
      // Build query parameters based on current filters
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

      // Convert data to CSV
      const headers = [
        "Timestamp",
        "Action",
        "Admin",
        "Target",
        "Details",
        "Severity",
      ];
      const csvRows = [
        headers.join(","),
        ...data.map((item: any) => {
          const adminName = item.admin
            ? `${item.admin.first_name || ""} ${item.admin.last_name || ""}`.trim() ||
              "Unknown User"
            : "System";

          return [
            new Date(item.timestamp).toISOString(),
            item.action_label,
            adminName,
            item.target,
            `"${item.details.replace(/"/g, '""')}"`, // Escape quotes in CSV
            item.severity,
          ].join(",");
        }),
      ];

      const csvContent = csvRows.join("\n");

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `activity_log_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting activity log:", error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Admin Activity Log</h1>
        </div>
      </div>

      <div className="mb-6">
        {/* Simple search and filter bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search activity log..."
              className="pl-9 shadow-none h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={filters.action}
            onValueChange={(value) => handleFilterChange("action", value)}
          >
            <SelectTrigger className="w-[180px] shadow-none h-10 cursor-pointer">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="all">Loading...</SelectItem>
              ) : (
                actionTypes.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          <Select
            value={filters.admin}
            onValueChange={(value) => handleFilterChange("admin", value)}
          >
            <SelectTrigger className="w-[150px] shadow-none h-10 cursor-pointer">
              <SelectValue placeholder="Admin" />
            </SelectTrigger>
            <SelectContent>
              {adminUsers.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.severity}
            onValueChange={(value) => handleFilterChange("severity", value)}
          >
            <SelectTrigger className="w-[150px] shadow-none h-10 cursor-pointer">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.timeRange}
            onValueChange={(value) => handleFilterChange("timeRange", value)}
          >
            <SelectTrigger className="w-[150px] shadow-none h-10 cursor-pointer">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-10 shadow-none cursor-pointer"
            disabled={activeFilterCount === 0}
          >
            Clear Filters
          </Button>

          <Button
            variant="outline"
            className="ml-auto shadow-none cursor-pointer h-10"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Active filters display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
            </div>

            {filters.action !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Action:{" "}
                {actionTypes.find((a) => a.value === filters.action)?.label ||
                  filters.action}
              </Badge>
            )}

            {filters.admin !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Admin:{" "}
                {adminUsers.find((a) => a.id === filters.admin)?.name ||
                  filters.admin}
              </Badge>
            )}

            {filters.severity !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Severity: {filters.severity}
              </Badge>
            )}

            {filters.timeRange !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Time: {filters.timeRange}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="mb-6">
        <ActivityLogTable searchTerm={searchTerm} filters={filters} />
      </div>
    </div>
  );
}
