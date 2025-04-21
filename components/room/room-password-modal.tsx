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
import { useRouter } from "next/navigation";

interface RoomPasswordModalProps {
  roomName: string;
  isOpen: boolean;
  onSubmit: (password: string) => Promise<boolean>;
}

export function RoomPasswordModal({
  roomName,
  isOpen,
  onSubmit,
}: RoomPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) return;

    setIsSubmitting(true);

    try {
      const success = await onSubmit(password);
      if (!success) {
        setPassword("");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error submitting password:", error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isSubmitting) return;
    router.push("/");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LockIcon className="h-5 w-5 text-amber-500" />
            Private Room Access
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{roomName}</h3>
            <p className="text-sm text-gray-500">
              This room requires a password to enter
            </p>
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
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Go Back
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
      </DialogContent>
    </Dialog>
  );
}
