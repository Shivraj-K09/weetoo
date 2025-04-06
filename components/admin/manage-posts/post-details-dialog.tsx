"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  User,
  Tag,
  Eye,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import type { Post } from "./post-management-table";

interface PostDetailsDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostDetailsDialog({
  post,
  open,
  onOpenChange,
}: PostDetailsDialogProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Format category name
  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Get status badge
  const getStatusBadge = (situation: string) => {
    if (situation === "posted") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 dark:bg-green-900/20"
        >
          Posted
        </Badge>
      );
    } else if (situation === "hidden") {
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
        >
          Hidden
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 dark:bg-red-900/20"
        >
          Deleted
        </Badge>
      );
    }
  };

  // Mock post content
  const postContent = `
    <h2>Introduction</h2>
    <p>The cryptocurrency market has seen significant changes in 2024. This article explores the key trends that are shaping the market this year.</p>
    
    <h2>Market Capitalization Growth</h2>
    <p>Total market capitalization has increased by 25% since January, with major cryptocurrencies leading the charge.</p>
    
    <h2>Institutional Adoption</h2>
    <p>More financial institutions are entering the cryptocurrency space, providing legitimacy and stability to the market.</p>
    
    <h2>Regulatory Developments</h2>
    <p>New regulations are being implemented globally, creating a more structured environment for cryptocurrency trading.</p>
    
    <h2>Technological Innovations</h2>
    <p>Advancements in blockchain technology continue to drive the evolution of cryptocurrencies and their applications.</p>
    
    <h2>Conclusion</h2>
    <p>Understanding these trends is essential for anyone involved in cryptocurrency investments or trading in 2024.</p>
  `;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="sticky top-0 z-10 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            Post Details
            {getStatusBadge(post.situation)}
          </DialogTitle>
          <DialogDescription>
            Post ID: <span className="font-mono">{post.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 flex-1 overflow-y-auto">
          {/* Post Title */}
          <div>
            <h2 className="text-xl font-semibold">{post.title}</h2>
          </div>

          {/* Author Information */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{getInitials(post.author.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{post.author.name}</h3>
              <p className="text-sm text-muted-foreground">Author</p>
            </div>
          </div>

          <Separator />

          {/* Post Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Publication Date</p>
                <p>{formatDate(post.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Category</p>
                <p>{formatCategory(post.category)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Eye className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Views</p>
                <p>{post.views.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Comments</p>
                <p>{post.comments.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ThumbsUp className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Likes</p>
                <p>{post.likes.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="capitalize">{post.situation}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Post Content */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Post Content</h4>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: postContent }}
            />
          </div>

          {/* Post Metadata */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Metadata</h4>
            <div className="bg-muted/50 p-4 rounded-md">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">SEO Title</span>
                <span className="text-sm">{post.title}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium">SEO Description</span>
                <span className="text-sm">
                  Explore the latest cryptocurrency market trends in 2024 and
                  understand how they impact your investments.
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm font-medium">Tags</span>
                <span className="text-sm">
                  cryptocurrency, market trends, 2024, investing, blockchain
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-10 bg-background pt-4 border-t mt-auto">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 cursor-pointer shadow-none"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
