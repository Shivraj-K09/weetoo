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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Coins,
  AlertTriangle,
  MapPin,
  Mail,
  Phone,
  Shield,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Mock additional user data
  const additionalUserData = {
    email: "user@example.com",
    phone: "+82 10-1234-5678",
    address: "Seoul, South Korea",
    role: "Standard User",
    accountActivity: [
      {
        type: "Login",
        date: "2024-06-30T09:15:00",
        details: "Successful login from Seoul, South Korea",
      },
      {
        type: "Transaction",
        date: "2024-06-29T14:22:00",
        details: "Purchased item with 5,000 KOR_COIN",
      },
      {
        type: "Profile Update",
        date: "2024-06-28T10:30:00",
        details: "Updated profile information",
      },
      {
        type: "Profile Update",
        date: "2024-06-28T10:30:00",
        details: "Updated profile information",
      },
      {
        type: "Profile Update",
        date: "2024-06-28T10:30:00",
        details: "Updated profile information",
      },
      {
        type: "Profile Update",
        date: "2024-06-28T10:30:00",
        details: "Updated profile information",
      },
    ],
  };

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
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center sm:items-start gap-2">
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="font-mono">
                  {user.uid}
                </Badge>
                {user.status === "active" && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20"
                  >
                    Active
                  </Badge>
                )}
                {user.status === "pending" && (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
                  >
                    Pending
                  </Badge>
                )}
                {user.status === "suspended" && (
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 dark:bg-red-900/20"
                  >
                    Suspended
                  </Badge>
                )}
                {user.status === "inactive" && (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 dark:bg-gray-900/20"
                  >
                    Inactive
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {additionalUserData.role}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{additionalUserData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Phone:</span>
              <span className="text-sm">{additionalUserData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Location:</span>
              <span className="text-sm">{additionalUserData.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">KOR_COIN:</span>
              <span className="text-sm">{formatAmount(user.korCoin)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Registered:</span>
              <span className="text-sm">{formatDate(user.registered)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Last Login:</span>
              <span className="text-sm">{formatDate(user.lastLogin)}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Warnings:</span>
              <span
                className={`text-sm ${
                  user.warnings > 0 ? "text-amber-600 font-medium" : ""
                }`}
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
              {additionalUserData.accountActivity.map((activity, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-md">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{activity.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <p className="text-sm">{activity.details}</p>
                </div>
              ))}
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
