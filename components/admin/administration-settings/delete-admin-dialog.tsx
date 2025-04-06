"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteAdminDialogProps {
  admin: {
    id: string;
    name: string;
    email: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAdminDialog({
  admin,
  open,
  onOpenChange,
}: DeleteAdminDialogProps) {
  const handleDelete = () => {
    // Here you would typically send the delete request to your API
    console.log("Deleting admin:", admin.id);

    // Close dialog
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Administrator</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this administrator? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{admin.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{admin.email}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
