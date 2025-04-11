"use client";

import type React from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { User } from "../users-table";
import { logUserAction } from "@/lib/service/activity-logger-client";

interface IssueWarningDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => Promise<void>;
}

export function IssueWarningDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: IssueWarningDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    warningType: "content",
    reason: "",
    notifyUser: true,
  });

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };

    fetchCurrentUser();
  }, []);

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

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, update the warnings count for the user
      const newWarningCount = (user.warnings || 0) + 1;

      // Check if this would exceed the maximum warnings (3)
      if (newWarningCount > 3) {
        toast.error("Warning limit reached", {
          description: "This user already has the maximum number of warnings.",
        });
        onOpenChange(false);
        return;
      }

      // Update the user's warning count
      const { error: updateError } = await supabase
        .from("users")
        .update({
          warnings: newWarningCount,
          // If this is the third warning, automatically suspend the account
          status: newWarningCount >= 3 ? "Suspended" : user.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Log the warning in the user_warnings table
      const { error: logError } = await supabase.from("user_warnings").insert({
        user_id: user.id,
        reason: formData.reason,
        warning_type: formData.warningType,
        issued_at: new Date().toISOString(),
        warning_number: newWarningCount,
        notify_user: formData.notifyUser,
      });

      if (logError) throw logError;

      // If notify user is checked, send a message
      if (formData.notifyUser) {
        const warningTypeMap: Record<string, string> = {
          content: "Inappropriate Content",
          behavior: "Disruptive Behavior",
          spam: "Spam or Advertising",
          terms: "Terms of Service Violation",
          other: "Policy Violation",
        };

        const warningTypeText =
          warningTypeMap[formData.warningType] || "Policy Violation";

        const { error: messageError } = await supabase.from("messages").insert({
          user_id: user.id,
          subject: `Warning: ${warningTypeText}`,
          message: `You have received a warning for: ${warningTypeText}\n\n${formData.reason}\n\nThis is warning #${newWarningCount} on your account. Please review our community guidelines and terms of service.`,
          message_type: "warning",
          send_email: true,
          send_push: true,
          sent_at: new Date().toISOString(),
          read: false,
        });

        if (messageError)
          console.error("Error sending warning message:", messageError);
      }

      toast.success("Warning issued", {
        description: `Warning has been issued to ${getFullName(user.first_name, user.last_name)}.`,
      });

      // If this was the third warning, show an additional notification
      if (newWarningCount >= 3) {
        toast.error("Account suspended", {
          description:
            "User has reached 3 warnings and their account has been automatically suspended.",
        });
      }

      // Call the onUserUpdated function if provided
      if (onUserUpdated) {
        await onUserUpdated();
      }

      // After successful warning issuance
      if (currentUserId) {
        await logUserAction(
          "user_warning",
          currentUserId,
          user.id,
          getFullName(user.first_name, user.last_name),
          `Issued warning to user "${getFullName(user.first_name, user.last_name)}". Reason: ${formData.reason}`,
          "medium",
          user.uid // Add the UID parameter
        );
      }

      // Reset form
      setFormData({
        warningType: "content",
        reason: "",
        notifyUser: true,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error issuing warning:", error);
      toast.error("There was an error issuing the warning.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Issue Warning
          </DialogTitle>
          <DialogDescription>
            Issue a formal warning to the user for policy violations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* User Information */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user.avatar_url || "/placeholder.svg?height=40&width=40"}
                alt={getFullName(user.first_name, user.last_name)}
              />
              <AvatarFallback>
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">
                {getFullName(user.first_name, user.last_name)}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {user.id}
              </p>
            </div>
            <div className="ml-auto bg-amber-50 text-amber-700 dark:bg-amber-900/20 px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Current Warnings: {user.warnings}
            </div>
          </div>

          <Separator />

          {/* Warning Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="warningType">Warning Type</Label>
              <Select
                value={formData.warningType}
                onValueChange={(value) =>
                  handleSelectChange("warningType", value)
                }
              >
                <SelectTrigger
                  id="warningType"
                  className="shadow-none h-10 w-full cursor-pointer"
                >
                  <SelectValue placeholder="Select warning type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Inappropriate Content</SelectItem>
                  <SelectItem value="behavior">Disruptive Behavior</SelectItem>
                  <SelectItem value="spam">Spam or Advertising</SelectItem>
                  <SelectItem value="terms">
                    Terms of Service Violation
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Warning</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Provide details about the warning..."
                value={formData.reason}
                onChange={handleChange}
                className="min-h-[120px] shadow-none"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyUser"
                name="notifyUser"
                checked={formData.notifyUser}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="notifyUser" className="text-sm font-normal">
                Notify user about this warning
              </Label>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-md text-sm text-amber-800 dark:text-amber-200">
            <p className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                Issuing a warning will increase the user&apos;s warning count.
                Multiple warnings may lead to account restrictions or
                suspension.
              </span>
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              className="shadow-none cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 shadow-none cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Issue Warning"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
