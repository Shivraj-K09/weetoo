"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { IconCrown, IconShield, IconUserCircle } from "@tabler/icons-react";
import {
  Activity,
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import type { User as UserType } from "../users-table";

interface ViewUserDialogProps {
  user: UserType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserDialog({
  user,
  open,
  onOpenChange,
}: ViewUserDialogProps) {
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

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  // Get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return (first + last).toUpperCase();
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
  };

  const fullName = getFullName(user.first_name, user.last_name);
  const status = (user.status || "Active").toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="gap-0">
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Comprehensive information about the user account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* User Profile Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
            <Avatar className="h-20 w-20 border">
              <AvatarImage src={user.avatar_url || ""} alt={fullName} />
              <AvatarFallback className="text-lg">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{fullName}</h3>
                {status === "active" && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 flex gap-1 items-center"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                )}
                {status === "pending" && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 flex gap-1 items-center"
                  >
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                )}
                {status === "suspended" && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 dark:bg-red-900/20 flex gap-1 items-center"
                  >
                    <Ban className="h-3 w-3" />
                    Suspended
                  </Badge>
                )}
                {status === "inactive" && (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 flex gap-1 items-center"
                  >
                    <XCircle className="h-3 w-3" />
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {user.uid}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {user.role === "user" && (
                  <span className="flex items-center gap-1 capitalize">
                    <IconUserCircle className="h-4.5 w-4.5" />
                    {user.role}
                  </span>
                )}
                {user.role === "admin" && (
                  <span className="flex items-center gap-1 capitalize text-blue-500">
                    <IconShield className="h-5 w-5 fill-blue-500 stroke-blue-700" />
                    {user.role}
                  </span>
                )}

                {user.role === "super_admin" && (
                  <span className="flex items-center gap-1 capitalize text-amber-500">
                    <IconCrown className="h-5 w-5 fill-yellow-500 stroke-yellow-700" />
                    {user.role === "super_admin" && "Super Admin"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Phone:</span>
              <span className="text-sm">Not provided</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location:</span>
              <span className="text-sm">Not provided</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">KOR_COIN:</span>
              <span className="text-sm">{formatAmount(user.kor_coins)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Registered:</span>
              <span className="text-sm">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Login:</span>
              <span className="text-sm">
                {formatDate(user.last_login || user.updated_at)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Warnings:</span>
              <span
                className={`text-sm ${user.warnings > 0 ? "text-amber-600 font-medium" : ""}`}
              >
                {user.warnings}
              </span>
            </div>
          </div>

          <Separator />

          {/* Recent Activity */}
          <div className="overflow-y-auto h-[275px]">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </h4>
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-center text-muted-foreground">
                  No recent activity to display
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
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
