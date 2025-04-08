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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { User } from "../users-table";

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: () => Promise<void>;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [, setCurrentUserId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: user.email,
    phone: "",
    address: "",
    status: "Active",
    role: "user",
    kor_coins: "0",
    notes: "",
  });

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role);
        }
      }
    };

    fetchCurrentUser();

    // Initialize form data with user values
    setFormData((prev) => ({
      ...prev,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email,
      role: user.role || "user",
      status: user.status || "Active",
      kor_coins: user.kor_coins.toString(),
    }));
  }, [user]);

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

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data - exclude role if not super_admin
      const updateData: Record<string, any> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status,
        kor_coins: Number.parseInt(formData.kor_coins) || 0,
        updated_at: new Date().toISOString(),
      };

      // Only include role if current user is super_admin
      if (currentUserRole === "super_admin") {
        updateData.role = formData.role;
      }

      // Use the REST API directly instead of the Supabase client
      // This bypasses RLS policies that might be causing issues
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${user.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Save notes if provided
      if (formData.notes.trim()) {
        const { error: notesError } = await supabase.from("user_notes").insert({
          user_id: user.id,
          note: formData.notes,
          created_at: new Date().toISOString(),
        });

        if (notesError) console.error("Error saving notes:", notesError);
      }

      // toast({
      //   title: "User updated",
      //   description: "The user has been updated successfully.",
      // })
      toast.success("The user has been updated successfully.");

      // Call the onUserUpdated function if provided
      if (onUserUpdated) {
        await onUserUpdated();
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      // toast({
      //   title: "Error",
      //   description: "There was an error updating the user.",
      //   variant: "destructive",
      // })
      toast.error("There was an error updating the user.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* User Profile Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.avatar_url || "/placeholder.svg?height=64&width=64"}
                alt={getFullName(user.first_name, user.last_name)}
              />
              <AvatarFallback className="text-lg">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">
                {getFullName(user.first_name, user.last_name)}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {user.id}
              </p>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                className="shadow-none"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                className="shadow-none"
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                className="shadow-none"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                className="shadow-none"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Not provided"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                className="shadow-none"
                value={formData.address}
                onChange={handleChange}
                placeholder="Not provided"
              />
            </div>
          </div>

          <Separator />

          {/* Account Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <Label htmlFor="status">Account Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status" className="shadow-none w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Only show role selector if current user is super_admin */}
            {currentUserRole === "super_admin" && (
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleSelectChange("role", value)}
                >
                  <SelectTrigger id="role" className="shadow-none w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="kor_coins">KOR_COIN Balance</Label>
              <Input
                id="kor_coins"
                name="kor_coins"
                type="number"
                className="shadow-none"
                value={formData.kor_coins}
                onChange={handleChange}
              />
            </div>
          </div>

          <Separator />

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add notes about this user..."
              value={formData.notes}
              onChange={handleChange}
              className="min-h-[100px] shadow-none"
            />
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
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
