"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExchangeUidManagementTable } from "@/components/admin/exchange-uid-management/exchange-uid-management-table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, CalendarIcon } from "lucide-react";

export default function ExchangeUidManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    situation: "all",
    exchange: "all",
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
        ? { from: range.from, to: range.to ?? undefined }
        : { from: undefined, to: undefined },
    }));
  };

  const clearFilters = () => {
    setFilters({
      situation: "all",
      exchange: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Mock data for summary metrics
  const summaryMetrics = {
    newUidsToday: 12,
    totalUids: 1245,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Exchange UID Management</h1>
        <p className="text-muted-foreground">
          View and manage exchange user identification numbers
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New UID (Today)
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics.newUidsToday}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total UID</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryMetrics.totalUids}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exchange UIDs..."
            className="pl-9 h-10 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={handleDateRangeChange}
        />
        <Select
          value={filters.situation}
          onValueChange={(value) => handleFilterChange("situation", value)}
        >
          <SelectTrigger className="w-[150px] h-10 shadow-none cursor-pointer">
            <SelectValue placeholder="Situation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All situations</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.exchange}
          onValueChange={(value) => handleFilterChange("exchange", value)}
        >
          <SelectTrigger className="w-[150px] h-10 shadow-none cursor-pointer">
            <SelectValue placeholder="Exchange" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All exchanges</SelectItem>
            <SelectItem value="Binance">Binance</SelectItem>
            <SelectItem value="Coinbase">Coinbase</SelectItem>
            <SelectItem value="Kraken">Kraken</SelectItem>
            <SelectItem value="Upbit">Upbit</SelectItem>
            <SelectItem value="Bithumb">Bithumb</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="default"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
          className="h-10 px-4 font-normal shadow-none cursor-pointer"
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
          {filters.situation !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Situation: {filters.situation}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange("situation", "all")}
              />
            </Badge>
          )}
          {filters.exchange !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Exchange: {filters.exchange}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange("exchange", "all")}
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

      <ExchangeUidManagementTable searchTerm={searchTerm} filters={filters} />
    </div>
  );
}
