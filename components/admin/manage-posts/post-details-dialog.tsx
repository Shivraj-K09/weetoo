"use client";

import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

import { Separator } from "@/components/ui/separator";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { DialogDescription } from "@/components/ui/dialog";

import { DialogTrigger } from "@/components/ui/dialog";

import { useState, memo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { format } from "date-fns";
import type { Post } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { logPostAction } from "@/lib/service/activity-logger-client";

interface PostDetailsDialogProps {
  post: Post;
  onApprove?: (postId: string) => Promise<void>;
  onReject?: (postId: string) => Promise<void>;
}

export const PostDetailsDialog = memo(
  ({ post, onApprove, onReject }: PostDetailsDialogProps) => {
    const [open, setOpen] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [, setRejectConfirmOpen] = useState(false);

    // Add state to track current user ID
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Add useEffect to fetch current user ID
    useEffect(() => {
      const fetchCurrentUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setCurrentUserId(data.user.id);
        }
      };

      fetchCurrentUser();
    }, []);

    const handleApprove = async () => {
      if (!onApprove) return;
      setIsApproving(true);
      try {
        await onApprove(post.id);

        // Log the activity after successful approval
        if (currentUserId) {
          await logPostAction(
            "post_approve",
            currentUserId,
            post.id,
            post.title
          );
        }

        setOpen(false);
      } finally {
        setIsApproving(false);
      }
    };

    const handleRejectConfirm = async () => {
      if (!onReject) return;
      setIsRejecting(true);
      try {
        await onReject(post.id);

        // Log the activity after successful rejection
        if (currentUserId) {
          await logPostAction(
            "post_reject",
            currentUserId,
            post.id,
            post.title
          );
        }

        setRejectConfirmOpen(false);
        setOpen(false);
      } finally {
        setIsRejecting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              View all the details of this post.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                value={post.title}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="slug" className="text-right">
                Slug
              </Label>
              <Input
                type="text"
                id="slug"
                value={"slug" in post ? String(post.slug) : post.id}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Badge
                  variant={
                    post.status === "pending"
                      ? "secondary"
                      : post.status === "approved"
                        ? "default"
                        : "destructive"
                  }
                >
                  {post.status}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="createdAt" className="text-right">
                Created At
              </Label>
              <Input
                type="text"
                id="createdAt"
                value={format(new Date(post.created_at), "PPP p")}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="updatedAt" className="text-right">
                Updated At
              </Label>
              <Input
                type="text"
                id="updatedAt"
                value={format(new Date(post.updated_at), "PPP p")}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Input
                type="text"
                id="content"
                value={post.content}
                className="col-span-3"
                disabled
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
            {post.status === "pending" ? (
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      onClick={() => setRejectConfirmOpen(true)}
                      disabled={isRejecting}
                    >
                      Reject
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        reject the post.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reason" className="text-right">
                          Reason
                        </Label>
                        <Input
                          type="text"
                          id="reason"
                          placeholder="Reason for rejection"
                          className="col-span-3"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setRejectConfirmOpen(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRejectConfirm}
                        disabled={isRejecting}
                      >
                        Reject
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="button"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  Approve
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

PostDetailsDialog.displayName = "PostDetailsDialog";
