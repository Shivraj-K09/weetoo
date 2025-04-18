"use client";

import type React from "react";

import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to create a room");
      return;
    }

    // Disable form submission while processing
    const submitButton = e.currentTarget.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading("Creating room...");

      // Hash password if room is private
      let hashedPassword = null;
      if (formData.privacy === "private" && formData.password) {
        hashedPassword = await bcrypt.hash(formData.password, 10);
      }

      // Prepare room data
      const roomData = {
        room_name: formData.title,
        room_type: formData.privacy,
        room_password: hashedPassword,
        trading_pairs: [formData.symbol],
        owner_id: user.id,
        participants: [user.id],
        current_participants: 1,
        max_participants: 100,
        room_category: formData.room_category,
      };

      // Insert room into Supabase with retry logic
      let retryCount = 0;
      let roomResult = null;

      while (retryCount < 3 && !roomResult) {
        try {
          const { data, error } = await supabase
            .from("trading_rooms")
            .insert(roomData)
            .select("id")
            .single();

          if (error) {
            console.error(
              `Error creating room (attempt ${retryCount + 1}):`,
              error
            );
            retryCount++;

            if (retryCount < 3) {
              // Wait before retrying
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              throw error;
            }
          } else {
            roomResult = data;
            break;
          }
        } catch (insertError) {
          console.error(
            `Exception during room creation (attempt ${retryCount + 1}):`,
            insertError
          );
          retryCount++;

          if (retryCount < 3) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            throw insertError;
          }
        }
      }

      if (!roomResult) {
        throw new Error("Failed to create room after multiple attempts");
      }

      // Close the loading toast
      toast.dismiss(loadingToast);

      // Close the popover
      setOpen(false);

      // Reset form
      setFormData({
        title: "",
        symbol: "BTCUSDT",
        privacy: "public",
        password: "",
        room_category: "regular",
      });
      setShowPassword(false);

      // Generate room slug
      const roomSlug = `${roomResult.id}-${formData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}`;

      if (formData.room_category === "voice") {
        window.open(
          `${window.location.origin}/voice-rooms/${roomSlug}?host=true`,
          "_blank",
          "width=1600,height=900"
        );
      } else {
        window.open(
          `${window.location.origin}/rooms/${roomSlug}`,
          "_blank",
          "width=1600,height=900"
        );
      }

      // Show success toast
      toast.success("Room created successfully");
    } catch (error) {
      console.error("Error in room creation:", error);
      toast.error("An error occurred while creating the room");
    } finally {
      // Re-enable the submit button
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              onClick={() => setOpen(false)}
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
              />

              <Select
                value={formData.symbol}
                onValueChange={(value) => handleSelectChange("symbol", value)}
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
              >
                <SelectTrigger className="rounded w-full shadow-none h-10 cursor-pointer">
                  <SelectValue placeholder="방 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    <div className="flex items-center">
                      <MessageSquareIcon className="h-4 w-4 mr-2" />
                      채팅방 (Regular Room)
                    </div>
                  </SelectItem>
                  <SelectItem value="voice">
                    <div className="flex items-center">
                      <MicIcon className="h-4 w-4 mr-2" />
                      음성방 (Voice Room)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Room type Private and Public */}
              <Select
                value={formData.privacy}
                onValueChange={(value) => handleSelectChange("privacy", value)}
              >
                <SelectTrigger className="rounded w-full shadow-none h-10 cursor-pointer">
                  <SelectValue placeholder="비공개방" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="private">
                    <div className="flex items-center">
                      <LockIcon className="h-4 w-4 mr-2" />
                      비공개방 (Private Room)
                    </div>
                  </SelectItem> */}
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
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={togglePasswordVisibility}
                    className="absolute right-0 top-0 h-10 w-10 text-gray-500"
                    aria-label="Toggle password visibility"
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
                6,900,000 KOR_COIN
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#E74C3C] mt-2 hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-12 cursor-pointer"
                disabled={formData.title.trim() === ""}
              >
                {formData.title.trim() === ""
                  ? "Enter Room Title"
                  : "1,000 KOR_COIN"}
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
