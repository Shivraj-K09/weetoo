"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  LockIcon,
  MessageSquareIcon,
  MicIcon,
  XIcon,
} from "lucide-react";
import type { Privacy, RoomCategory, UserProfile } from "@/types/index";

// Room creation costs
const ROOM_COSTS = {
  regular: 5000, // Regular Room: 5,000 KOR_COIN
  voice: 8000, // Voice Room: 8,000 KOR_COIN
};

interface CreateRoomPopoverProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UserProfile | null;
}

export function CreateRoomPopover({
  open,
  setOpen,
  user,
}: CreateRoomPopoverProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    symbol: "BTCUSDT",
    privacy: "public" as Privacy,
    password: "",
    room_category: "regular" as RoomCategory,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "privacy") {
      // Validate that value is a valid Privacy type
      if (value !== "public" && value !== "private") {
        console.error("Invalid privacy value:", value);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value as Privacy }));
    } else if (name === "room_category") {
      // Validate that value is a valid RoomCategory type
      if (value !== "regular" && value !== "voice") {
        console.error("Invalid room category value:", value);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value as RoomCategory }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const createRoom = useCallback(async () => {
    if (!user) {
      toast.error("You must be logged in to create a room");
      return null;
    }

    // Prepare room data for insertion
    const roomData = {
      owner_id: user.id, // Changed from created_by to owner_id
      room_name: formData.title, // Changed from title to room_name to match schema
      room_type: formData.privacy, // Changed from privacy to room_type to match schema
      room_password: formData.password
        ? await bcrypt.hash(formData.password, 10)
        : null,
      trading_pairs: [formData.symbol], // Make sure it's an array
      room_category: formData.room_category,
      participants: [user.id], // Initialize with the creator as a participant
      current_participants: 1, // Start with 1 participant (the creator)
    };

    // Insert room into Supabase with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timed out")), 10000); // 10 second timeout
    });

    try {
      // Create the room
      const { data, error } = (await Promise.race([
        supabase.from("trading_rooms").insert(roomData).select("id").single(),
        timeoutPromise,
      ])) as any;

      if (error) {
        console.error("Error creating room:", error);
        throw error;
      }

      // No KOR_COIN deduction - completely removed
      console.log(
        `Room created without deducting ${ROOM_COSTS[formData.room_category].toLocaleString()} KOR_COIN from user balance`
      );

      return data;
    } catch (error) {
      console.error("Failed to create room:", error);
      throw error;
    }
  }, [formData, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a room");
      return;
    }

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    // Validate form
    if (!formData.title.trim()) {
      toast.error("Room title is required");
      return;
    }

    if (formData.privacy === "private" && !formData.password) {
      toast.error("Password is required for private rooms");
      return;
    }

    // No KOR_COIN balance check - completely removed
    const roomCost = ROOM_COSTS[formData.room_category];

    setIsSubmitting(true);
    const loadingToast = toast.loading("Creating room...");

    try {
      // Try to create the room with up to 2 retries
      let roomResult = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!roomResult && attempts < maxAttempts) {
        try {
          attempts++;
          roomResult = await createRoom();

          if (!roomResult) {
            throw new Error("Failed to create room - no data returned");
          }
        } catch (error) {
          console.error(`Room creation attempt ${attempts} failed:`, error);

          if (attempts >= maxAttempts) {
            throw error;
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Generate room slug
      const roomSlug = `${roomResult.id}-${formData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}`;

      // Reset form and close popover
      setFormData({
        title: "",
        symbol: "BTCUSDT",
        privacy: "public",
        password: "",
        room_category: "regular",
      });
      setShowPassword(false);
      setOpen(false);

      // Dismiss loading toast
      toast.dismiss(loadingToast);
      toast.success("Room created successfully");

      // Conditional redirection based on room category
      if (formData.room_category === "voice") {
        // For voice rooms, redirect to the voice-rooms route
        window.open(
          `${window.location.origin}/voice-room/${roomSlug}`,
          "_blank",
          "width=1600,height=900"
        );
      } else {
        // For regular rooms, use the existing rooms route
        window.open(
          `${window.location.origin}/rooms/${roomSlug}`,
          "_blank",
          "width=1600,height=900"
        );
      }
    } catch (error) {
      console.error("Error in room creation:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to create room. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing the popover while submitting
        if (isSubmitting && !newOpen) {
          return;
        }
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <Button className="font-semibold bg-[#E74C3C] hover:bg-[#E74C3C]/90 rounded text-white cursor-pointer h-10">
          Create a Trading Room
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-[#434753] px-4 py-2.5 text-white">
            <h2 className="font-semibold">채팅방 개설하기</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => !isSubmitting && setOpen(false)}
              disabled={isSubmitting}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Form or Login Button */}
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-2 p-4">
              {/* Room title */}
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="방제목을 입력해 주세요."
                className="rounded w-full shadow-none h-10"
                required
                disabled={isSubmitting}
              />

              <Select
                value={formData.symbol}
                onValueChange={(value) => handleSelectChange("symbol", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded w-full shadow-none h-10 cursor-pointer">
                  <SelectValue placeholder="BTCUSDT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                  <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                  <SelectItem value="BNBUSDT">BNBUSDT</SelectItem>
                </SelectContent>
              </Select>

              {/* Room category selection */}
              <Select
                value={formData.room_category}
                onValueChange={(value) =>
                  handleSelectChange("room_category", value)
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded w-full shadow-none h-10 cursor-pointer">
                  <SelectValue placeholder="방 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    <div className="flex items-center">
                      <MessageSquareIcon className="h-4 w-4 mr-2" />
                      Regular Room
                    </div>
                  </SelectItem>
                  <SelectItem value="voice">
                    <div className="flex items-center">
                      <MicIcon className="h-4 w-4 mr-2" />
                      Voice Room
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Room type Private and Public */}
              <Select
                value={formData.privacy}
                onValueChange={(value) => handleSelectChange("privacy", value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="rounded w-full shadow-none h-10 cursor-pointer">
                  <SelectValue placeholder="비공개방" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center">
                      <LockIcon className="h-4 w-4 mr-2" />
                      비공개방 (Private Room)
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <GlobeIcon className="h-4 w-4 mr-2" />
                      공개방 (Public Room)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.privacy === "private" && (
                <div className="relative">
                  <Input
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="비밀번호를 입력해 주세요"
                    type={showPassword ? "text" : "password"}
                    className="rounded w-full shadow-none h-10"
                    required
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-0 top-0 h-10 w-10 text-gray-500"
                    aria-label="Toggle password visibility"
                    disabled={isSubmitting}
                  >
                    {showPassword ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeOffIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
              )}

              {/* Price Info */}
              <div className="text-right text-xs text-[#E74C3C] font-medium pt-5">
                {user?.kor_coins?.toLocaleString() || "0"} KOR_COIN
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#E74C3C] mt-2 hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-12 cursor-pointer"
                disabled={isSubmitting || formData.title.trim() === ""}
              >
                {isSubmitting
                  ? "Creating Room..."
                  : formData.title.trim() === ""
                    ? "Enter Room Title"
                    : `${ROOM_COSTS[formData.room_category].toLocaleString()} KOR_COIN`}
              </Button>
            </form>
          ) : (
            <div className="p-6 flex flex-col items-center">
              <p className="text-center mb-4 text-gray-600">
                You need to be logged in to create a trading room
              </p>
              <Link href="/login">
                <Button className="bg-[#E74C3C] hover:bg-[#E74C3C]/90 text-white font-medium">
                  Login to Continue
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
