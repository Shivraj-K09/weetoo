"use client";

import { useState, memo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ImageCarousel } from "@/components/post/image-carousel";
import type { Post } from "@/types";

interface PostDetailsDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (postId: string) => Promise<void>;
  onReject?: (postId: string) => Promise<void>;
}

// Use memo to prevent unnecessary re-renders
export const PostDetailsDialog = memo(function PostDetailsDialog({
  post,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: PostDetailsDialogProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectConfirmOpen, setRejectConfirmOpen] = useState(false);

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsApproving(true);
    try {
      await onApprove(post.id);
      onOpenChange(false);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!onReject) return;
    setIsRejecting(true);
    try {
      await onReject(post.id);
      setRejectConfirmOpen(false);
      onOpenChange(false);
    } finally {
      setIsRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPP");
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  const authorName = post.user
    ? `${post.user.first_name || ""} ${post.user.last_name || ""}`.trim()
    : "Anonymous";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {/* Fixed Header */}
          <DialogHeader className="sticky top-0 z-10 bg-background px-6 py-4 border-b">
            <DialogTitle className="text-xl">Post Details</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 rounded-md"
                >
                  {post.category}
                </Badge>
                {post.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" className="rounded-md">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h2 className="text-2xl font-bold">{post.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={post.user?.avatar_url || ""}
                      alt={authorName}
                    />
                    <AvatarFallback>{getInitials(authorName)}</AvatarFallback>
                  </Avatar>
                  <span>{authorName}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span title={formatDate(post.created_at)}>
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>{post.view_count || 0} views</span>
                </div>
              </div>

              {post.featured_images?.length > 0 && (
                <div className="my-4">
                  <ImageCarousel images={post.featured_images} />
                </div>
              )}

              <div
                className="prose prose-sm sm:prose-base max-w-none post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="sticky bottom-0 z-10 bg-background px-6 py-4 border-t flex-col sm:flex-row gap-2">
            {post.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setRejectConfirmOpen(true)}
                  disabled={isRejecting || isApproving}
                  className="w-full sm:w-auto bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {isRejecting ? "Rejecting..." : "Reject Post"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isRejecting || isApproving}
                  className="w-full sm:w-auto bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isApproving ? "Approving..." : "Approve Post"}
                </Button>
              </>
            )}
            {post.status !== "pending" && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={rejectConfirmOpen} onOpenChange={setRejectConfirmOpen}>
        <AlertDialogContent className="flex flex-col">
          <AlertDialogHeader className="sticky top-0 z-10 bg-background">
            <AlertDialogTitle>
              Are you sure you want to reject this post?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the post as rejected. The post will not be
              visible to users and the author will not be able to edit it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sticky bottom-0 z-10 bg-background mt-4">
            <AlertDialogCancel disabled={isRejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleRejectConfirm();
              }}
              disabled={isRejecting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isRejecting ? "Rejecting..." : "Reject Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
