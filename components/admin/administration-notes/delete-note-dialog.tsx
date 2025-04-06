"use client";

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

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: {
    id: string;
    user: string;
    note: string;
  };
}

export function DeleteNoteDialog({
  open,
  onOpenChange,
  note,
}: DeleteNoteDialogProps) {
  const handleDelete = () => {
    // Here you would typically send a delete request to your API
    console.log("Deleting note:", note.id);

    // Close the dialog
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the administration note for{" "}
            <strong>{note.user}</strong>. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 cursor-pointer shadow-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 h-10 shadow-none cursor-pointer"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
