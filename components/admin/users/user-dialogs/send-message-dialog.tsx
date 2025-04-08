"use client";

import type React from "react";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
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
import { Check, AlertCircle, Bell, Info } from "lucide-react";
import { toast } from "sonner";
import type { User } from "../users-table";

interface SendMessageDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendMessageDialog({
  user,
  open,
  onOpenChange,
}: SendMessageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    messageType: "info",
    message: "",
    sendEmail: true,
    sendPush: true,
  });

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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      // Save the message to the database
      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        subject: formData.subject,
        message: formData.message,
        message_type: formData.messageType,
        send_email: formData.sendEmail,
        send_push: formData.sendPush,
        sent_at: new Date().toISOString(),
        read: false,
      });

      if (error) throw error;

      // toast({
      //   title: "Message sent",
      //   description: "Your message has been sent successfully.",
      // })
      toast.success("Your message has been sent successfully.");

      // Reset form
      setFormData({
        subject: "",
        messageType: "info",
        message: "",
        sendEmail: true,
        sendPush: true,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      // toast({
      //   title: "Error",
      //   description: "There was an error sending your message.",
      //   variant: "destructive",
      // })
      toast.error("There was an error sending your message.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send a notification or message to the user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Recipient Information */}
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
          </div>

          <Separator />

          {/* Message Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="Message subject"
                className="shadow-none h-10"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select
                value={formData.messageType}
                onValueChange={(value) =>
                  handleSelectChange("messageType", value)
                }
              >
                <SelectTrigger
                  id="messageType"
                  className="shadow-none h-10 w-full"
                >
                  <SelectValue placeholder="Select message type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info" className="flex items-center">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span>Information</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="success">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Success</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="warning">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span>Warning</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="alert">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-red-500" />
                      <span>Alert</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter your message here..."
                value={formData.message}
                onChange={handleChange}
                className="min-h-[150px] shadow-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Options</Label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="sendEmail" className="text-sm font-normal">
                    Send as email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendPush"
                    name="sendPush"
                    checked={formData.sendPush}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="sendPush" className="text-sm font-normal">
                    Send as push notification
                  </Label>
                </div>
              </div>
            </div>
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
              className="shadow-none cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
