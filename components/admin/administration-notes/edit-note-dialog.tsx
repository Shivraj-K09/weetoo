"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Check, ChevronsUpDown } from "lucide-react";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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

interface AdminUser {
  id: string;
  uid: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string;
  avatar_url: string | null;
}

interface EditNoteDialogProps {
  note: AdminNote;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteUpdated?: () => Promise<void>;
}

export function EditNoteDialog({
  note,
  open,
  onOpenChange,
  onNoteUpdated,
}: EditNoteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  // Add currentUserId state
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userId: note.user_id,
    priority: note.priority,
    date: new Date(note.date),
    note: note.note,
  });

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: userData, error } = await supabase
          .from("users")
          .select("role, id")
          .eq("id", data.user.id)
          .single();

        if (!error && userData) {
          setCurrentUserRole(userData.role);
          setCurrentUserId(userData.id);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch admin users
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("id, uid, first_name, last_name, email, role, avatar_url")
          .or("role.eq.admin,role.eq.super_admin");

        if (error) {
          console.error("Error fetching admin users:", error);
          return;
        }

        // Filter out the current user from the list
        const filteredUsers =
          data?.filter((user) => user.id !== currentUserId) || [];
        setAdminUsers(filteredUsers);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (open && currentUserId) {
      fetchAdminUsers();
    }
  }, [open, currentUserId]);

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

  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, date }));
    }
  };

  // Get full name
  const getFullName = (firstName: string | null, lastName: string | null) => {
    return [firstName, lastName].filter(Boolean).join(" ") || "Unknown User";
  };

  // Get initials from name
  const getInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName ? firstName.charAt(0) : "";
    const last = lastName ? lastName.charAt(0) : "";
    return (first + last).toUpperCase();
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if current user is super_admin
      if (currentUserRole !== "super_admin") {
        toast.error("Permission denied", {
          description: "Only super admins can edit administration notes.",
        });
        onOpenChange(false);
        return;
      }

      // Update the note in Supabase
      const { error } = await supabase
        .from("admin_notes")
        .update({
          user_id: formData.userId,
          note: formData.note,
          priority: formData.priority,
          date: formData.date.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", note.id);

      if (error) throw error;

      toast.success("Note updated", {
        description: "The administration note has been updated successfully.",
      });

      // Call the onNoteUpdated function if provided
      if (onNoteUpdated) {
        await onNoteUpdated();
      }

      // Get target admin name
      const targetAdmin = adminUsers.find(
        (user) => user.id === formData.userId
      );
      const targetAdminName = targetAdmin
        ? getFullName(targetAdmin.first_name, targetAdmin.last_name)
        : "Unknown Admin";

      // After successful update
      await logNoteAction(
        "admin_note_update",
        currentUserId!,
        note.id,
        targetAdminName
      );

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Error", {
        description: "There was an error updating the note.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected user
  const selectedUser = formData.userId
    ? adminUsers.find((user) => user.id === formData.userId)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Administration Note</DialogTitle>
          <DialogDescription>
            Update the administration note details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between shadow-none"
                >
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            selectedUser.avatar_url ||
                            "/placeholder.svg?height=24&width=24"
                          }
                          alt={getFullName(
                            selectedUser.first_name,
                            selectedUser.last_name
                          )}
                        />
                        <AvatarFallback>
                          {getInitials(
                            selectedUser.first_name,
                            selectedUser.last_name
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {getFullName(
                          selectedUser.first_name,
                          selectedUser.last_name
                        )}
                      </span>
                    </div>
                  ) : (
                    "Select user"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {adminUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.first_name} ${user.last_name} ${user.email}`}
                          onSelect={() => {
                            setFormData((prev) => ({
                              ...prev,
                              userId: user.id,
                            }));
                            setOpenCombobox(false);
                          }}
                          className="flex items-center gap-2"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  user.avatar_url ||
                                  "/placeholder.svg?height=32&width=32"
                                }
                                alt={getFullName(
                                  user.first_name,
                                  user.last_name
                                )}
                              />
                              <AvatarFallback>
                                {getInitials(user.first_name, user.last_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span>
                                {getFullName(user.first_name, user.last_name)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4",
                              formData.userId === user.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority" className="shadow-none">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal shadow-none",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    {formData.date ? (
                      format(formData.date, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Enter note details..."
              value={formData.note}
              onChange={handleChange}
              className="min-h-[150px] shadow-none"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="shadow-none cursor-pointer"
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
