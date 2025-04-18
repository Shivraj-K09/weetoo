"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deletePost } from "@/app/actions/post-actions";
import { useRouter } from "next/navigation";
import { DeleteIcon, type DeleteIconHandle } from "./delete-icon"; // Import the custom DeleteIcon and its handle type

interface DeletePostDialogProps {
  postId: string;
}

export function DeletePostDialog({ postId }: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const deleteIconRef = useRef<DeleteIconHandle>(null);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePost(postId);

      if (!result.error) {
        // Redirect to the board after successful deletion
        router.push("/free-board");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-none h-10 "
          onMouseEnter={() => deleteIconRef.current?.startAnimation()}
          onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
        >
          <DeleteIcon ref={deleteIconRef} size={16} />
          Delete Post
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-7 shadow-xl p-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="border-b py-2 border-zinc-200">
            Are you sure you want to delete this post?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your post
            and remove it from the board.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeleting}
            className="cursor-pointer h-10"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600 cursor-pointer h-10"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
