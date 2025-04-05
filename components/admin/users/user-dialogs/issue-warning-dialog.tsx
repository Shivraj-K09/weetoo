"use client";

import type React from "react";

import { useState } from "react";
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
import type { User } from "../users-table";

interface IssueWarningDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueWarningDialog({
  user,
  open,
  onOpenChange,
}: IssueWarningDialogProps) {
  // Form state
  const [formData, setFormData] = useState({
    warningType: "content",
    reason: "",
    notifyUser: true,
  });

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Warning data:", formData);
    onOpenChange(false);
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
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {user.uid}
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
                Issuing a warning will increase the user's warning count.
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
            >
              Issue Warning
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
