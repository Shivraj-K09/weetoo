"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, User } from "lucide-react";

interface AdminNote {
  id: string;
  user_id: string;
  note: string;
  priority: string;
  created_by: string;
  date: string;
  created_at: string;
  user?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  creator?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

interface ViewNoteDialogProps {
  note: AdminNote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewNoteDialog({
  note,
  open,
  onOpenChange,
}: ViewNoteDialogProps) {
  const [userDetails, setUserDetails] = useState<any>(null);
  const [creatorDetails, setCreatorDetails] = useState<any>(null);

  // Fetch user and creator details if not already included
  useEffect(() => {
    const fetchDetails = async () => {
      if (!note.user && note.user_id) {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", note.user_id)
          .single();

        if (!error && data) {
          setUserDetails(data);
        }
      }

      if (!note.creator && note.created_by) {
        const { data, error } = await supabase
          .from("users")
          .select("first_name, last_name, email")
          .eq("id", note.created_by)
          .single();

        if (!error && data) {
          setCreatorDetails(data);
        }
      }
    };

    if (open) {
      fetchDetails();
    }
  }, [open, note]);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMMM d, yyyy");
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "High":
        return <Badge variant="destructive">{priority}</Badge>;
      case "Medium":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            {priority}
          </Badge>
        );
      case "Low":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            {priority}
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const user = note.user || userDetails;
  const creator = note.creator || creatorDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Administration Note Details</DialogTitle>
          <DialogDescription>
            View the complete details of this administration note.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">User:</span>
              <span className="text-sm">
                {user
                  ? getFullName(user.first_name, user.last_name)
                  : "Loading..."}
              </span>
            </div>
            <div>{getPriorityBadge(note.priority)}</div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Date:</span>
              <span className="text-sm">{formatDate(note.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm">{formatDate(note.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Created By:</span>
              <span className="text-sm">
                {creator
                  ? getFullName(creator.first_name, creator.last_name)
                  : "Loading..."}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-sm font-medium">Note:</span>
            </div>
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{note.note}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer shadow-none"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
