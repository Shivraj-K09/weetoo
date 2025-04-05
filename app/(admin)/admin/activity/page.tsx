"use client";

import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";

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

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== "all"
  ).length;

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
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="user_create">User Create</SelectItem>
              <SelectItem value="user_update">User Update</SelectItem>
              <SelectItem value="user_delete">User Delete</SelectItem>
              <SelectItem value="user_suspend">User Suspend</SelectItem>
              <SelectItem value="user_warning">User Warning</SelectItem>
              <SelectItem value="transaction_approve">
                Transaction Approve
              </SelectItem>
              <SelectItem value="transaction_reject">
                Transaction Reject
              </SelectItem>
              <SelectItem value="settings_change">Settings Change</SelectItem>
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
              <SelectItem value="all">All Admins</SelectItem>
              <SelectItem value="Admin 1">Admin 1</SelectItem>
              <SelectItem value="Admin 2">Admin 2</SelectItem>
              <SelectItem value="Admin 3">Admin 3</SelectItem>
              <SelectItem value="Admin 4">Admin 4</SelectItem>
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
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Export</span>
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
                Action: {filters.action.replace(/_/g, " ")}
              </Badge>
            )}

            {filters.admin !== "all" && (
              <Badge variant="secondary" className="text-xs">
                Admin: {filters.admin}
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
