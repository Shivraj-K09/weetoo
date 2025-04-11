"use client";

import type React from "react";

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
import { supabase } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";
import { EyeIcon, EyeOffIcon, GlobeIcon, LockIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";

type Privacy = "private" | "public";

interface UserData {
  first_name: string;
  last_name: string;
}

interface RoomData {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  owner_id: string;
  created_at: string;
  users: UserData | UserData[];
}

interface Room {
  id: string;
  title: string;
  symbol: string;
  privacy: Privacy;
  createdAt: Date;
  username: string;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  kor_coins: number;
}

export function TradingRooms() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    symbol: "BTCUSDT",
    privacy: "private" as Privacy,
    password: "",
  });

  // Add this near the top of the component, after the useState declarations
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          // Fetch user data from the users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            return;
          }

          setUser(userData);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Fetch user data when signed in
          const { data: userData, error } = await supabase
            .from("users")
            .select("id, first_name, last_name, email, kor_coins")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
            return;
          }

          setUser(userData);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch rooms from Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchRooms = async () => {
      try {
        setIsRoomsLoading(true);
        console.log("Fetching rooms...");
        const { data, error } = await supabase
          .from("trading_rooms")
          .select(
            `
            id,
            room_name,
            room_type,
            trading_pairs,
            current_participants,
            owner_id,
            created_at,
            users:owner_id (first_name, last_name)
          `
          )
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching rooms:", error);
          return;
        }

        if (!isMounted) return;

        console.log("Rooms fetched:", data);

        // Transform data with proper typing
        const transformedRooms = (data as RoomData[]).map((room) => {
          // Handle users as an array or single object
          const userObj = Array.isArray(room.users)
            ? (room.users[0] as UserData)
            : (room.users as UserData);

          return {
            id: room.id,
            title: room.room_name,
            symbol: room.trading_pairs[0], // Use the first trading pair
            privacy: room.room_type as Privacy,
            createdAt: new Date(room.created_at),
            username: userObj
              ? `${userObj.first_name} ${userObj.last_name}`
              : "Unknown",
          };
        });

        setRooms(transformedRooms);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setIsRoomsLoading(false);
      }
    };

    // Call fetchRooms immediately
    fetchRooms();

    // Set up real-time subscription for rooms
    const roomSubscription = supabase
      .channel("trading_rooms_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trading_rooms" },
        () => {
          console.log("Room change detected, refreshing rooms...");
          fetchRooms();
        }
      )
      .subscribe();

    // Add a small delay and fetch again to ensure data is loaded
    const timeoutId = setTimeout(() => {
      if (rooms.length === 0) {
        console.log("No rooms found after initial load, trying again...");
        fetchRooms();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      supabase.removeChannel(roomSubscription);
    };
  }, [rooms.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "privacy") {
      // Validate that value is a valid Privacy type
      if (value !== "private" && value !== "public") {
        console.error("Invalid privacy value:", value);
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: value as Privacy }));
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
        max_participants: 50, // Add a default value for max_participants
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
        privacy: "private",
        password: "",
      });
      setShowPassword(false);

      // Generate room slug
      const roomSlug = `${roomResult.id}-${formData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}`;

      window.open(
        `${window.location.origin}/rooms/${roomSlug}`,
        "_blank",
        "width=1600,height=900"
      );

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

  const handleRoomClick = useCallback(
    async (room: Room) => {
      try {
        // Show loading toast
        const loadingToast = toast.loading("Accessing room...");

        // If room is private, check if user is the owner or already a participant
        if (room.privacy === "private" && user) {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("owner_id, participants")
            .eq("id", room.id)
            .single();

          if (error) {
            console.error("Error checking room access:", error);
            toast.dismiss(loadingToast);
            toast.error("Failed to access room");
            return;
          }

          const isOwner = data.owner_id === user.id;
          const isParticipant = data.participants.includes(user.id);

          if (!isOwner && !isParticipant) {
            // Dismiss loading toast before showing prompt
            toast.dismiss(loadingToast);

            // Prompt for password
            const password = prompt(
              "This is a private room. Please enter the password:"
            );
            if (!password) return;

            // Show loading toast again
            const verifyingToast = toast.loading("Verifying password...");

            // Verify password
            try {
              const { data: roomData, error: roomError } = await supabase
                .from("trading_rooms")
                .select("room_password")
                .eq("id", room.id)
                .single();

              if (roomError) {
                console.error("Error fetching room password:", roomError);
                toast.dismiss(verifyingToast);
                toast.error("Failed to verify password");
                return;
              }

              const isPasswordCorrect = await bcrypt.compare(
                password,
                roomData.room_password
              );
              if (!isPasswordCorrect) {
                toast.dismiss(verifyingToast);
                toast.error("Incorrect password");
                return;
              }

              // Add user to participants
              const { error: updateError } = await supabase
                .from("trading_rooms")
                .update({
                  participants: [...data.participants, user.id],
                  current_participants: data.participants.length + 1,
                })
                .eq("id", room.id);

              if (updateError) {
                console.error("Error updating participants:", updateError);
                // Continue anyway, as this is not critical
              }

              toast.dismiss(verifyingToast);
            } catch (verifyError) {
              console.error("Error during password verification:", verifyError);
              toast.dismiss(verifyingToast);
              toast.error("Failed to verify password");
              return;
            }
          } else {
            // User is already a participant or owner, dismiss loading toast
            toast.dismiss(loadingToast);
          }
        } else {
          // Public room, dismiss loading toast
          toast.dismiss(loadingToast);
        }

        // Navigate to room
        const roomSlug = `${room.id}-${room.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")}`;

        // Use router.push
        window.open(
          `${window.location.origin}/rooms/${roomSlug}`,
          "_blank",
          "width=1600,height=900"
        );
      } catch (error) {
        console.error("Error accessing room:", error);
        toast.error("Failed to access room");
      }
    },
    [router, supabase, user]
  );

  // Format time difference
  const formatTimeDiff = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return `${Math.floor(diffHours / 24)}d ago`;
  };

  // Number of skeleton items to show (only when fewer than 9 rooms)
  const skeletonCount = Math.max(0, 9 - rooms.length);
  const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i + 1);

  return (
    <div className="w-full h-full">
      <div className="flex justify-end w-full py-3">
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
                    onValueChange={(value) =>
                      handleSelectChange("symbol", value)
                    }
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

                  {/* Room type Private and Public */}
                  <Select
                    value={formData.privacy}
                    onValueChange={(value) =>
                      handleSelectChange("privacy", value)
                    }
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

                  {/* {user.kor_coins < 1000 && (
                    <p className="text-xs text-red-500 text-center mt-1">
                      You need at least 1,000 KOR_COIN to create a room
                    </p>
                  )} */}
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
      </div>
      <div className="w-full border-2 border-amber-500 rounded-sm overflow-hidden shadow-md bg-white">
        <div className="overflow-y-auto max-h-[600px]">
          {isRoomsLoading && rooms.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E74C3C]"></div>
            </div>
          ) : (
            <>
              {/* Real Rooms - Always show all rooms */}
              {rooms.map((room, index) => (
                <div
                  key={`room-${room.id}`}
                  className="flex items-center border-b border-gray-200 py-3 px-2 bg-white hover:bg-amber-50 cursor-pointer relative"
                  onClick={() => handleRoomClick(room)}
                >
                  {/* Rank */}
                  <div className="flex flex-col items-center mr-3 w-8">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center bg-blue-100 text-blue-800 font-medium">
                      {index + 1}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Rank</div>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 mr-3 shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    <span className="text-2xl">
                      {room.symbol.substring(0, 1)}
                    </span>
                  </div>

                  {/* Time and Status */}
                  <div className="flex flex-col mr-3 min-w-[60px]">
                    <div className="flex gap-2">
                      <div className="px-2 py-0.5 bg-red-500 text-red-800 rounded-sm text-xs font-medium">
                        {room.symbol}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-1">
                      {formatTimeDiff(room.createdAt)}
                    </div>
                  </div>

                  {/* Title and Privacy */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {room.title}
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      {room.privacy === "private" ? (
                        <>
                          <LockIcon className="h-4 w-4 mr-1" />
                          <span className="font-medium">비공개방</span>
                        </>
                      ) : (
                        <>
                          <GlobeIcon className="h-4 w-4 mr-1" />
                          <span className="font-medium">공개방</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Avatar and Username */}
                  <div className="flex items-center ml-auto">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8">
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center text-xs font-medium">
                          {room.username.substring(0, 2).toUpperCase()}
                        </div>
                      </Avatar>
                      <div className="ml-1 text-sm text-gray-700">
                        {room.username}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Skeleton Items - Only show when fewer than 9 rooms */}
              {skeletonItems.map((index) => (
                <div
                  key={`skeleton-${index}`}
                  className={`flex items-center border-b border-gray-200 py-3 px-2 ${
                    index === 1 && rooms.length === 0
                      ? "bg-amber-50"
                      : "bg-white"
                  } relative`}
                >
                  {/* Hanging Medal Skeleton (only for first and last items) */}
                  {(index === 1 || index === skeletonCount) && (
                    <div className="absolute left-[70%] transform -translate-x-1/2 -top-[6px] z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-3 bg-gray-300 rounded-t-full animate-pulse"></div>
                        <div className="w-8 h-8 rounded-full bg-amber-200 animate-pulse flex items-center justify-center shadow-md">
                          <div className="w-5 h-5 rounded-full bg-amber-300 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rank Skeleton */}
                  <div className="flex flex-col items-center mr-3 w-8">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center animate-pulse ${
                        index === 1
                          ? "bg-blue-200"
                          : index === 2
                            ? "bg-gray-200"
                            : "bg-gray-200"
                      }`}
                    />
                    <div className="w-6 h-2 bg-gray-200 rounded animate-pulse mt-1" />
                  </div>

                  {/* Thumbnail Skeleton */}
                  <div className="relative w-14 h-14 mr-3 flex-shrink-0">
                    <div className="absolute inset-0 bg-gray-200 rounded-md overflow-hidden animate-pulse" />
                  </div>

                  {/* Time and Status Skeleton */}
                  <div className="flex flex-col mr-3 min-w-[60px]">
                    <div className="flex gap-2">
                      <div className="w-12 h-4 bg-red-200 rounded-sm animate-pulse" />
                      <div className="w-12 h-4 bg-red-200 rounded-sm animate-pulse" />
                    </div>
                    <div className="w-10 h-3 bg-gray-200 rounded animate-pulse mt-1" />
                  </div>

                  {/* Title and Ratio Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="w-40 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center mt-1">
                      <div className="w-15 h-3 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>

                  {/* Avatar and Username Skeleton */}
                  <div className="flex items-center ml-auto">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      <div className="w-20 h-3 bg-gray-200 rounded animate-pulse ml-1" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State when no rooms and no skeletons */}
              {rooms.length === 0 && skeletonItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <p>No trading rooms available</p>
                  <Button
                    onClick={() => setOpen(true)}
                    className="bg-[#E74C3C] mt-2 hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-12 cursor-pointer"
                  >
                    Create a Trading Room
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
