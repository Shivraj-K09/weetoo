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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Mail, Shield } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface Admin {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  status: string;
  updated_at: string;
  last_login?: string;
}

interface ViewAdminDialogProps {
  admin: Admin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewAdminDialog({
  admin,
  open,
  onOpenChange,
}: ViewAdminDialogProps) {
  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "outline";
    }
  };

  const getSituationBadgeVariant = (situation: string) => {
    switch (situation.toLowerCase()) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "suspended":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Administrator Details</DialogTitle>
            <DialogDescription>
              View information about this administrator.
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        <div className="pb-4 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">
              {getFullName(admin.first_name, admin.last_name)}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">
              {admin.id}
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{admin.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Role:</span>
              <Badge variant={getLevelBadgeVariant(admin.role)}>
                {admin.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={getSituationBadgeVariant(admin.status)}>
                {admin.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Account Updated:</span>
              <span className="text-sm">{formatDate(admin.updated_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Login:</span>
              <span className="text-sm">
                {formatDate(admin.last_login || admin.updated_at)}
              </span>
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
