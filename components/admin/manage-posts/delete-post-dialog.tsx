"use client";

import { useState, memo, useEffect } from "react";
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
import type { Post } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { logPostAction } from "@/lib/service/activity-logger-client";
import { toast } from "sonner";

interface DeletePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  onDelete: () => Promise<void>;
}

export const DeletePostDialog = memo(
  ({ open, onOpenChange, post, onDelete }: DeletePostDialogProps) => {
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDelete = async () => {
      setIsDeleting(true);
      try {
        // Log the activity before deletion
        if (currentUserId) {
          await logPostAction(
            "post_delete",
            currentUserId,
            post.id,
            post.title
          );
        }

        // Call the onDelete function provided by the parent component
        await onDelete();

        // Show success toast
        toast.success("Post deleted successfully");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
      } finally {
        setIsDeleting(false);
        onOpenChange(false);
      }
    };

    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post &quot;{post.title}&quot; from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);

DeletePostDialog.displayName = "DeletePostDialog";
