"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UidManagementTable } from "@/components/admin/uid-management/uid-management-table";
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

export default function UidManagementPage() {
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
      dateRange: { from: range?.from, to: range?.to },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">UID Management</h1>
        <p className="text-muted-foreground">
          View and manage user identification numbers for exchange verification
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search UIDs..."
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
          <SelectTrigger className="w-[150px] shadow-none h-10 cursor-pointer">
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
          <SelectTrigger className="w-[150px] shadow-none h-10 cursor-pointer">
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

      <UidManagementTable searchTerm={searchTerm} filters={filters} />
    </div>
  );
}
