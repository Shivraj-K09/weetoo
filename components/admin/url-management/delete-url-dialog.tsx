"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteURLDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: {
    id: string;
    name: string;
  };
  onConfirm: () => void;
}

export function DeleteURLDialog({
  open,
  onOpenChange,
  url,
  onConfirm,
}: DeleteURLDialogProps) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onConfirm();
    setIsPending(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Delete URL</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this URL? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="">
          <p className="text-sm font-medium">
            You are about to delete:{" "}
            <span className="font-bold">{url.name}</span>
          </p>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 shadow-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-10 shadow-none cursor-pointer"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete URL"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
