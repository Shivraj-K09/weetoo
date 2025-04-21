"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, LockIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Room } from "@/types/index";
import { toast } from "sonner";
import { joinRoom } from "@/app/actions/join-room";

interface PasswordModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PasswordModal({
  room,
  isOpen,
  onClose,
  onSuccess,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room) return;

    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Verifying password...");

    try {
      const result = await joinRoom(room.id, password);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message);
        setPassword("");
        onSuccess();
      } else {
        toast.error(result.message || "Incorrect password");
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to join room");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setPassword("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-amber-500" />
            Private Room Access
          </DialogTitle>
        </DialogHeader>

        {room && (
          <div className="py-4">
            <div className="mb-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold">{room.title}</h3>
                <p className="text-sm text-gray-500">
                  Created by {room.username}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-100"
                >
                  {room.symbol}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 hover:bg-red-100"
                >
                  Private Room
                </Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter room password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={isSubmitting}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isSubmitting || !password.trim()}
                >
                  {isSubmitting ? "Verifying..." : "Join Room"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
