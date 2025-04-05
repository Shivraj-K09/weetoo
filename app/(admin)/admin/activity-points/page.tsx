"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityPointsTable } from "@/components/admin/activity-points/activity-points-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/admin/date-range-picker";
import { format } from "date-fns";
import { X } from "lucide-react";
import type { DateRange } from "react-day-picker";

export default function ActivityPointsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    activityType: "all",
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
  });

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((value) => {
    if (typeof value === "object" && value !== null) {
      // Handle dateRange object
      return value.from || value.to;
    }
    return value !== "all";
  }).length;

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range
        ? { from: range.from, to: range.to }
        : { from: undefined, to: undefined },
    }));
  };

  const clearFilters = () => {
    setFilters({
      activityType: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">
          Activity Points Management
        </h1>
        <p className="text-muted-foreground">
          View and manage user activity points earned through platform
          engagement
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activity points..."
            className="pl-9 shadow-none h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={handleDateRangeChange}
        />
        <Select
          value={filters.activityType}
          onValueChange={(value) => handleFilterChange("activityType", value)}
        >
          <SelectTrigger className="w-[180px] shadow-none h-10 cursor-pointer">
            <SelectValue placeholder="Activity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All activity types</SelectItem>
            <SelectItem value="post">Post Creation</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
            <SelectItem value="like">Like</SelectItem>
            <SelectItem value="share">Share</SelectItem>
            <SelectItem value="login">Login Bonus</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="content">Content Creation</SelectItem>
            <SelectItem value="checkin">Daily Check-in</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="default"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="h-10 px-4 font-normal cursor-pointer shadow-none"
        >
          Clear Filters
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="shadow-none h-10 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.activityType !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Activity Type: {filters.activityType}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange("activityType", "all")}
              />
            </Badge>
          )}
          {filters.dateRange.from && (
            <Badge variant="secondary" className="text-xs">
              From: {format(filters.dateRange.from, "PP")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() =>
                  handleDateRangeChange({
                    ...filters.dateRange,
                    from: undefined,
                  })
                }
              />
            </Badge>
          )}
          {filters.dateRange.to && (
            <Badge variant="secondary" className="text-xs">
              To: {format(filters.dateRange.to, "PP")}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() =>
                  handleDateRangeChange({ ...filters.dateRange, to: undefined })
                }
              />
            </Badge>
          )}
        </div>
      )}

      <ActivityPointsTable searchTerm={searchTerm} filters={filters} />
    </div>
  );
}
