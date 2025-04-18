"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostManagementTable } from "@/components/admin/manage-posts/post-management-table";
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
import { toast } from "sonner";
import {
  getAdminPosts,
  approvePost,
  rejectPost,
  togglePostVisibility,
  deletePost,
} from "@/app/actions/admin-content-actions";
import type { Post } from "@/types";

export default function ManagePostsClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    dateRange: {
      from: undefined as Date | undefined,
      to: undefined as Date | undefined,
    },
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter((value) => {
    if (typeof value === "object" && value !== null) {
      // Handle dateRange object
      return value.from || value.to;
    }
    return value !== "all";
  }).length;

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const data = await getAdminPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

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
      category: "all",
      status: "all",
      dateRange: {
        from: undefined,
        to: undefined,
      },
    });
  };

  // Handle post approval
  const handleApprovePost = useCallback(async (postId: string) => {
    try {
      const result = await approvePost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        // Update local state
        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              return { ...post, status: "approved" };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error approving post:", error);
      toast.error("Failed to approve post");
    }
  }, []);

  // Handle post rejection
  const handleRejectPost = useCallback(async (postId: string) => {
    try {
      const result = await rejectPost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        // Update local state
        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              return { ...post, status: "rejected" };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error rejecting post:", error);
      toast.error("Failed to reject post");
    }
  }, []);

  // Handle post visibility toggle
  const handleToggleVisibility = useCallback(
    async (postId: string, currentStatus: string) => {
      const isCurrentlyVisible = currentStatus === "approved";
      try {
        const result = await togglePostVisibility(postId, !isCurrentlyVisible);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(result.message);
          // Update local state
          setPosts((currentPosts) =>
            currentPosts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  status: isCurrentlyVisible ? "hidden" : "approved",
                };
              }
              return post;
            })
          );
        }
      } catch (error) {
        console.error("Error toggling post visibility:", error);
        toast.error("Failed to update post visibility");
      }
    },
    []
  );

  // Handle post deletion
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const result = await deletePost(postId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        // Update local state
        setPosts((currentPosts) =>
          currentPosts.map((post) => {
            if (post.id === postId) {
              return { ...post, status: "deleted" };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Post Management</h1>
        <p className="text-muted-foreground">
          View and manage all posts on the platform
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
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
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger className="w-[150px] h-10 shadow-none cursor-pointer">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
            <SelectItem value="trading">Trading</SelectItem>
            <SelectItem value="investment">Investment</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="analysis">Analysis</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="tutorial">Tutorial</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[150px] h-10 shadow-none cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
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
        <Button variant="outline" className="h-10 cursor-pointer shadow-none">
          <Download className="h-4 w-4" />
          <span className="sr-only">Export</span>
        </Button>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Category: {filters.category}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange("category", "all")}
              />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange("status", "all")}
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

      <PostManagementTable
        searchTerm={searchTerm}
        filters={filters}
        posts={posts}
        loading={loading}
        onApprovePost={handleApprovePost}
        onRejectPost={handleRejectPost}
        onToggleVisibility={handleToggleVisibility}
        onDeletePost={handleDeletePost}
      />
    </div>
  );
}
