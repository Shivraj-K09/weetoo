"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange } from "react-day-picker";
import { formatDistanceToNow, format } from "date-fns";
import { PostDetailsDialog } from "./post-details-dialog";
import { DeletePostDialog } from "./delete-post-dialog";
import type { Post } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { logPostAction } from "@/lib/service/activity-logger-client";

interface PostManagementTableProps {
  searchTerm: string;
  filters: {
    category: string;
    status: string;
    dateRange: DateRange;
  };
  posts: Post[];
  loading: boolean;
  onApprovePost: (postId: string) => Promise<void>;
  onRejectPost: (postId: string) => Promise<void>;
  onToggleVisibility: (postId: string, currentStatus: string) => Promise<void>;
  onDeletePost: (postId: string) => Promise<void>;
}

export function PostManagementTable({
  searchTerm,
  filters,
  posts,
  loading,
  onApprovePost,
  onRejectPost,
  onToggleVisibility,
  onDeletePost,
}: PostManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user ID for activity logging
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

  // Format date to a readable format
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  }, []);

  // Get initials from name
  const getInitials = useCallback((name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, []);

  // Format category name
  const formatCategory = useCallback((category: string) => {
    if (!category) return "";
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, []);

  // Handle approve with activity logging
  const handleApprovePost = useCallback(
    async (postId: string) => {
      try {
        await onApprovePost(postId);

        // Find the post to get its title for logging
        const post = posts.find((p) => p.id === postId);
        if (post && currentUserId) {
          await logPostAction(
            "post_approve",
            currentUserId,
            postId,
            post.title
          );
        }
      } catch (error) {
        console.error("Error approving post:", error);
      }
    },
    [posts, currentUserId, onApprovePost]
  );

  // Handle reject with activity logging
  const handleRejectPost = useCallback(
    async (postId: string) => {
      try {
        await onRejectPost(postId);

        // Find the post to get its title for logging
        const post = posts.find((p) => p.id === postId);
        if (post && currentUserId) {
          await logPostAction("post_reject", currentUserId, postId, post.title);
        }
      } catch (error) {
        console.error("Error rejecting post:", error);
      }
    },
    [posts, currentUserId, onRejectPost]
  );

  // Handle toggle visibility with activity logging
  const handleToggleVisibility = useCallback(
    async (postId: string, currentStatus: string) => {
      try {
        await onToggleVisibility(postId, currentStatus);

        // Find the post to get its title for logging
        const post = posts.find((p) => p.id === postId);
        if (post && currentUserId) {
          // Log the appropriate action based on current status
          const action =
            currentStatus === "approved" ? "post_hide" : "post_show";
          await logPostAction(action, currentUserId, postId, post.title);
        }
      } catch (error) {
        console.error("Error toggling post visibility:", error);
      }
    },
    [posts, currentUserId, onToggleVisibility]
  );

  // Add this function after the handleToggleVisibility function
  const handleDeletePost = useCallback(
    async (postId: string) => {
      try {
        // Find the post to get its title for logging
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        // Call the onDeletePost function
        await onDeletePost(postId);

        // Log is already handled in the DeletePostDialog component

        // Close the dialog if it's open
        setDeleteDialogOpen(false);
        setSelectedPost(null);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    },
    [posts, onDeletePost]
  );

  // Filter data based on search term and filters - memoized to prevent recalculation
  const filteredData = useMemo(() => {
    return posts.filter((post) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const authorName = post.user
          ? `${post.user.first_name || ""} ${post.user.last_name || ""}`
              .trim()
              .toLowerCase()
          : "";

        const matchesSearch =
          post.title.toLowerCase().includes(searchLower) ||
          authorName.includes(searchLower) ||
          post.category.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all" && post.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status !== "all" && post.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const postDate = new Date(post.created_at);
        const startOfDay = new Date(filters.dateRange.from);
        startOfDay.setHours(0, 0, 0, 0);

        if (postDate < startOfDay) {
          return false;
        }
      }

      if (filters.dateRange.to) {
        const postDate = new Date(post.created_at);
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);

        if (postDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [posts, searchTerm, filters]);

  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo<ColumnDef<Post>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium max-w-[300px] truncate">
            {row.getValue("title")}
          </div>
        ),
      },
      {
        accessorKey: "user",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Author
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const user = row.getValue("user") as {
            first_name: string;
            last_name: string;
            avatar_url: string;
          };
          const name = user
            ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
            : "Anonymous";
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || ""} alt={name} />
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{name}</div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const userA = rowA.getValue("user") as {
            first_name: string;
            last_name: string;
          };
          const userB = rowB.getValue("user") as {
            first_name: string;
            last_name: string;
          };
          const nameA = userA
            ? `${userA.first_name || ""} ${userA.last_name || ""}`.trim()
            : "";
          const nameB = userB
            ? `${userB.first_name || ""} ${userB.last_name || ""}`.trim()
            : "";
          return nameA.localeCompare(nameB);
        },
      },
      {
        accessorKey: "category",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div>{formatCategory(row.getValue("category"))}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <>
              {status === "approved" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/20"
                >
                  Approved
                </Badge>
              )}
              {status === "pending" && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
                >
                  Pending
                </Badge>
              )}
              {status === "rejected" && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 dark:bg-red-900/20"
                >
                  Rejected
                </Badge>
              )}
              {status === "hidden" && (
                <Badge
                  variant="outline"
                  className="bg-slate-50 text-slate-700 dark:bg-slate-900/20"
                >
                  Hidden
                </Badge>
              )}
              {status === "deleted" && (
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 dark:bg-red-900/20"
                >
                  Deleted
                </Badge>
              )}
            </>
          );
        },
      },
      {
        accessorKey: "view_count",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Views
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-center">{row.getValue("view_count") || 0}</div>
        ),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = formatDate(row.getValue("created_at"));
          const relativeTime = formatDistanceToNow(
            new Date(row.getValue("created_at")),
            { addSuffix: true }
          );
          return (
            <div>
              <div>{date}</div>
              <div className="text-xs text-muted-foreground">
                {relativeTime}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          const isDeleted = post.status === "deleted";
          const isPending = post.status === "pending";
          const isApproved = post.status === "approved";
          // const isHidden = post.status === "hidden";
          const isRejected = post.status === "rejected";

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 cursor-pointer shadow-none"
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedPost(post);
                      setDetailsDialogOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>

                  {isPending && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleApprovePost(post.id)}
                        className="cursor-pointer text-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRejectPost(post.id)}
                        className="cursor-pointer text-red-600"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}

                  {!isDeleted && !isPending && !isRejected && (
                    <DropdownMenuItem
                      onClick={() =>
                        handleToggleVisibility(post.id, post.status)
                      }
                      className="cursor-pointer"
                    >
                      {isApproved ? (
                        <>
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Hide Post
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Show Post
                        </>
                      )}
                    </DropdownMenuItem>
                  )}

                  {!isDeleted && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedPost(post);
                        setDeleteDialogOpen(true);
                      }}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [
      formatDate,
      formatCategory,
      getInitials,
      handleApprovePost,
      handleRejectPost,
      handleToggleVisibility,
    ]
  );

  // Create table instance with memoized data
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
  });

  // Reset to first page when filters change
  useEffect(() => {
    table.setPageIndex(0);
  }, [searchTerm, filters, table]);

  // Clean up selected post when dialog closes
  useEffect(() => {
    if (!detailsDialogOpen && !deleteDialogOpen) {
      setSelectedPost(null);
    }
  }, [detailsDialogOpen, deleteDialogOpen]);

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
                  Loading posts...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
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
      <div className="flex flex-wrap items-center justify-between space-y-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {filteredData.length}{" "}
            posts
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px] shadow-none cursor-pointer">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">per page</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 shadow-none cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-10 shadow-none cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Post details dialog */}
      {selectedPost && detailsDialogOpen && (
        <PostDetailsDialog
          post={selectedPost}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onApprove={onApprovePost}
          onReject={onRejectPost}
        />
      )}

      {/* Delete post dialog */}
      {selectedPost && deleteDialogOpen && (
        <DeletePostDialog
          post={selectedPost}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onDelete={() => handleDeletePost(selectedPost.id)}
        />
      )}
    </>
  );
}
