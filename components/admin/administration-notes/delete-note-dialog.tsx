"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { logNoteAction } from "@/lib/service/activity-logger-client";

interface AdminNote {
  id: string;
  user_id: string;
  note: string;
  priority: string;
  created_by: string;
  date: string;
  created_at: string;
}

interface DeleteNoteDialogProps {
  note: AdminNote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteDeleted?: () => Promise<void>;
}

export function DeleteNoteDialog({
  note,
  open,
  onOpenChange,
  onNoteDeleted,
}: DeleteNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role);
          setCurrentUserId(data.user.id);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Handle delete
  const handleDelete = async () => {
    setIsLoading(true);

    try {
      // Check if current user is super_admin
      if (currentUserRole !== "super_admin") {
        toast.error("Permission denied", {
          description: "Only super admins can delete administration notes.",
        });
        onOpenChange(false);
        return;
      }

      // Get target admin information
      const { data: userData } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", note.user_id)
        .single();

      const targetAdminName = userData
        ? `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          "Unknown Admin"
        : "Unknown Admin";

      // Delete the note from Supabase
      const { error } = await supabase
        .from("admin_notes")
        .delete()
        .eq("id", note.id);

      if (error) throw error;

      // After successful deletion
      await logNoteAction(
        "admin_note_delete",
        currentUserId!,
        note.id,
        targetAdminName
      );

      toast.success("Note deleted", {
        description: "The administration note has been deleted successfully.",
      });

      // Call the onNoteDeleted function if provided
      if (onNoteDeleted) {
        await onNoteDeleted();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Error", {
        description: "There was an error deleting the note.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Administration Note
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this administration note? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm font-medium">Note:</p>
            <p className="text-sm mt-1">{note.note}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="shadow-none cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="shadow-none cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
