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
import { Ban, AlertTriangle } from "lucide-react";
import type { User } from "../users-table";

interface SuspendAccountDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspendAccountDialog({
  user,
  open,
  onOpenChange,
}: SuspendAccountDialogProps) {
  // Form state
  const [formData, setFormData] = useState({
    suspensionType: "temporary",
    duration: "7",
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
    console.log("Suspension data:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="h-5 w-5" />
            Suspend Account
          </DialogTitle>
          <DialogDescription>
            Temporarily or permanently suspend this user account.
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
            <div className="ml-auto bg-red-50 text-red-700 dark:bg-red-900/20 px-2 py-1 rounded-md text-sm flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Warnings: {user.warnings}
            </div>
          </div>

          <Separator />

          {/* Suspension Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="suspensionType">Suspension Type</Label>
              <Select
                value={formData.suspensionType}
                onValueChange={(value) =>
                  handleSelectChange("suspensionType", value)
                }
              >
                <SelectTrigger
                  id="suspensionType"
                  className="shadow-none w-full cursor-pointer h-10"
                >
                  <SelectValue placeholder="Select suspension type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="temporary">
                    Temporary Suspension
                  </SelectItem>
                  <SelectItem value="permanent">Permanent Ban</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.suspensionType === "temporary" && (
              <div className="space-y-2">
                <Label htmlFor="duration">Suspension Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    handleSelectChange("duration", value)
                  }
                >
                  <SelectTrigger
                    id="duration"
                    className="shadow-none w-full h-10 cursor-pointer"
                  >
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Suspension</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Provide details about the suspension..."
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
                Notify user about this suspension
              </Label>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-md text-sm text-red-800 dark:text-red-200">
            <p className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>
                {formData.suspensionType === "permanent"
                  ? "Permanently banning this account will prevent the user from accessing the platform indefinitely. This action cannot be easily reversed."
                  : "Suspending this account will temporarily prevent the user from accessing the platform for the specified duration."}
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
              variant="destructive"
              className="shadow-none cursor-pointer"
            >
              {formData.suspensionType === "permanent"
                ? "Permanently Ban Account"
                : "Suspend Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
