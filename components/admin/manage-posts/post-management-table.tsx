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
  Edit,
  Trash2,
  AlertTriangle,
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
import { PostDetailsDialog } from "./post-details-dialog";
import { EditPostDialog } from "./edit-post-dialog";
import { DeletePostDialog } from "./delete-post-dialog";

// Sample post data
const postData = [
  {
    id: "POST-24060501",
    title: "Understanding Cryptocurrency Market Trends in 2024",
    author: {
      name: "Kim Min-ji",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "cryptocurrency",
    situation: "posted",
    views: 1250,
    comments: 45,
    likes: 87,
    date: "2024-06-30T09:15:00",
  },
  {
    id: "POST-24060502",
    title: "Top 10 Trading Strategies for Beginners",
    author: {
      name: "Park Ji-sung",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "trading",
    situation: "posted",
    views: 980,
    comments: 32,
    likes: 65,
    date: "2024-06-29T14:22:00",
  },
  {
    id: "POST-24060503",
    title: "How to Diversify Your Investment Portfolio",
    author: {
      name: "Lee Soo-jin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "investment",
    situation: "hidden",
    views: 750,
    comments: 28,
    likes: 42,
    date: "2024-06-29T11:05:00",
  },
  {
    id: "POST-24060504",
    title: "Blockchain Technology: Beyond Cryptocurrencies",
    author: {
      name: "Choi Woo-shik",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "technology",
    situation: "posted",
    views: 1120,
    comments: 38,
    likes: 76,
    date: "2024-06-28T16:48:00",
  },
  {
    id: "POST-24060505",
    title: "Breaking: Major Exchange Announces New Token Listing",
    author: {
      name: "Kang Hye-jung",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "news",
    situation: "deleted",
    views: 1500,
    comments: 52,
    likes: 95,
    date: "2024-06-28T10:30:00",
  },
  {
    id: "POST-24060506",
    title: "Technical Analysis: Bitcoin Price Prediction",
    author: {
      name: "Jung Ho-yeon",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "analysis",
    situation: "posted",
    views: 1350,
    comments: 48,
    likes: 82,
    date: "2024-06-27T15:40:00",
  },
  {
    id: "POST-24060507",
    title: "Step-by-Step Guide to Setting Up a Crypto Wallet",
    author: {
      name: "Bae Suzy",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "tutorial",
    situation: "posted",
    views: 890,
    comments: 35,
    likes: 68,
    date: "2024-06-27T13:25:00",
  },
  {
    id: "POST-24060508",
    title: "The Impact of Regulations on Cryptocurrency Markets",
    author: {
      name: "Gong Yoo",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "cryptocurrency",
    situation: "hidden",
    views: 780,
    comments: 30,
    likes: 55,
    date: "2024-06-26T10:15:00",
  },
  {
    id: "POST-24060509",
    title: "Risk Management in Volatile Markets",
    author: {
      name: "Son Ye-jin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "trading",
    situation: "posted",
    views: 950,
    comments: 40,
    likes: 72,
    date: "2024-06-25T16:20:00",
  },
  {
    id: "POST-24060510",
    title: "Long-term vs Short-term Investment Strategies",
    author: {
      name: "Hyun Bin",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    category: "investment",
    situation: "posted",
    views: 1050,
    comments: 42,
    likes: 78,
    date: "2024-06-25T11:45:00",
  },
];

export type Post = (typeof postData)[0];

interface PostManagementTableProps {
  searchTerm: string;
  filters: {
    category: string;
    situation: string;
    dateRange: DateRange;
  };
}

export function PostManagementTable({
  searchTerm,
  filters,
}: PostManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [posts, setPosts] = useState(postData);

  // Format date to a readable format
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, []);

  // Format time to a readable format
  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }, []);

  // Get initials from name
  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, []);

  // Format category name
  const formatCategory = useCallback((category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }, []);

  // Handle post visibility toggle
  const togglePostVisibility = useCallback((postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          const newSituation =
            post.situation === "posted" ? "hidden" : "posted";
          return { ...post, situation: newSituation };
        }
        return post;
      })
    );
  }, []);

  // Handle post deletion
  const handleDeletePost = useCallback((postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, situation: "deleted" };
        }
        return post;
      })
    );
    setDeleteDialogOpen(false);
  }, []);

  // Handle post update
  const handleUpdatePost = useCallback((updatedPost: Post) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === updatedPost.id) {
          return updatedPost;
        }
        return post;
      })
    );
    setEditDialogOpen(false);
  }, []);

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
        accessorKey: "author",
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
          const author = row.getValue("author") as {
            name: string;
            avatar: string;
          };
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>{getInitials(author.name)}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{author.name}</div>
            </div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const authorA = rowA.getValue("author") as { name: string };
          const authorB = rowB.getValue("author") as { name: string };
          return authorA.name.localeCompare(authorB.name);
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
        accessorKey: "situation",
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
          const situation = row.getValue("situation") as string;
          return (
            <>
              {situation === "posted" && (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 dark:bg-green-900/20"
                >
                  Posted
                </Badge>
              )}
              {situation === "hidden" && (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
                >
                  Hidden
                </Badge>
              )}
              {situation === "deleted" && (
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
        accessorKey: "views",
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
          <div className="text-right">{row.getValue("views")}</div>
        ),
      },
      {
        accessorKey: "comments",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Comments
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("comments")}</div>
        ),
      },
      {
        accessorKey: "likes",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="p-0 hover:bg-transparent"
            >
              Likes
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="text-right">{row.getValue("likes")}</div>
        ),
      },
      {
        accessorKey: "date",
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
          const date = formatDate(row.getValue("date"));
          const time = formatTime(row.getValue("date"));
          return (
            <div>
              <div>{date}</div>
              <div className="text-xs text-muted-foreground">{time}</div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          const isDeleted = post.situation === "deleted";

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
                  {!isDeleted && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedPost(post);
                          setEditDialogOpen(true);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => togglePostVisibility(post.id)}
                        className="cursor-pointer"
                      >
                        {post.situation === "posted" ? (
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
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [formatDate, formatTime, getInitials, formatCategory, togglePostVisibility]
  );

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    return posts.filter((post) => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          post.title.toLowerCase().includes(searchLower) ||
          post.author.name.toLowerCase().includes(searchLower) ||
          post.category.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category !== "all" && post.category !== filters.category) {
        return false;
      }

      // Situation filter
      if (filters.situation !== "all" && post.situation !== filters.situation) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const postDate = new Date(post.date);
        const startOfDay = new Date(filters.dateRange.from);
        startOfDay.setHours(0, 0, 0, 0);

        if (postDate < startOfDay) {
          return false;
        }
      }

      if (filters.dateRange.to) {
        const postDate = new Date(post.date);
        const endOfDay = new Date(filters.dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);

        if (postDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [searchTerm, filters, posts]);

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
    if (!detailsDialogOpen && !editDialogOpen && !deleteDialogOpen) {
      // Use a timeout to prevent memory leaks
      const timer = setTimeout(() => {
        setSelectedPost(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [detailsDialogOpen, editDialogOpen, deleteDialogOpen]);

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
            {table.getRowModel().rows?.length ? (
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
                  No results.
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
      {selectedPost && (
        <PostDetailsDialog
          post={selectedPost}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
        />
      )}

      {/* Edit post dialog */}
      {selectedPost && (
        <EditPostDialog
          post={selectedPost}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdate={handleUpdatePost}
        />
      )}

      {/* Delete post dialog */}
      {selectedPost && (
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
