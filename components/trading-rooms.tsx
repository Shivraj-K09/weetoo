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
import { EyeIcon, EyeOffIcon, GlobeIcon, LockIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "./ui/avatar";

type Privacy = "private" | "public";

interface Room {
  id: string;
  title: string;
  symbol: string;
  privacy: Privacy;
  createdAt: Date;
  username: string;
}

const saveRoomsToStorage = (rooms: Room[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("tradingRooms", JSON.stringify(rooms));
  }
};

// Get rooms from localStorage
const getRoomsFromStorage = (): Room[] => {
  if (typeof window !== "undefined") {
    const storedRooms = localStorage.getItem("tradingRooms");
    if (storedRooms) {
      try {
        return JSON.parse(storedRooms).map((room: Room) => ({
          ...room,
          createdAt: new Date(room.createdAt),
        }));
      } catch (e) {
        console.error("Error parsing stored rooms:", e);
      }
    }
  }
  return [];
};

// Store room details in localStorage
const saveRoomDetails = (
  roomId: string,
  details: { symbol: string; privacy: Privacy }
) => {
  if (typeof window !== "undefined") {
    const roomsDetails = JSON.parse(
      localStorage.getItem("roomsDetails") || "{}"
    );
    roomsDetails[roomId] = details;
    localStorage.setItem("roomsDetails", JSON.stringify(roomsDetails));
  }
};

export function TradingRooms() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    symbol: "BTCUSDT",
    privacy: "private" as Privacy,
    password: "",
  });

  useEffect(() => {
    const storedRooms = getRoomsFromStorage();
    if (storedRooms.length > 0) {
      setRooms(storedRooms);
    }
  }, []);

  // Save rooms to localStorage when they change
  useEffect(() => {
    if (rooms.length > 0) {
      saveRoomsToStorage(rooms);
    }
  }, [rooms]);

  // Number of skeleton items to show (only when fewer than 9 rooms)
  const skeletonCount = Math.max(0, 9 - rooms.length);
  const skeletonItems = Array.from({ length: skeletonCount }, (_, i) => i + 1);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate a unique room ID
    const roomId = Math.random().toString(36).substring(2, 10);

    // Generate a room name (slugified version of title or random if empty)
    const roomName = formData.title
      ? formData.title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "")
      : Math.random().toString(36).substring(2, 10);

    // Create new room
    const newRoom: Room = {
      id: roomId,
      title: formData.title || "Untitled Room",
      symbol: formData.symbol,
      privacy: formData.privacy,
      createdAt: new Date(),
      username: "User" + Math.floor(Math.random() * 1000), // Random username for demo
    };

    // Add to rooms list
    setRooms((prevRooms) => [newRoom, ...prevRooms]);

    // Store room details separately
    saveRoomDetails(roomId, {
      symbol: formData.symbol,
      privacy: formData.privacy,
    });
    console.log("Saving room with privacy:", formData.privacy);

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

    // Navigate to the room with clean URL
    // router.push(`/rooms/${roomId}-${roomName}`);
    // Navigate the room to the new window
    window.open(
      `/rooms/${roomId}-${roomName}`,
      "_blank",
      "width=1600,height=900"
    );
  };

  const handleRoomClick = (room: Room) => {
    // Store room details
    saveRoomDetails(room.id, {
      symbol: room.symbol,
      privacy: room.privacy,
    });

    // Navigate with clean URL
    const roomSlug = `${room.id}-${room.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")}`;
    // router.push(`/rooms/${roomSlug}`);
    // Navigate the room to the new window
    window.open(`/rooms/${roomSlug}`, "_blank", "width=1600,height=900");
  };

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

              {/* Form */}
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
                >
                  1,000 KOR_COIN
                </Button>
              </form>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full border-2 border-amber-500 rounded-sm overflow-hidden shadow-md bg-white">
        <div className="overflow-y-auto max-h-[600px]">
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
                <span className="text-2xl">{room.symbol.substring(0, 1)}</span>
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
                index === 1 && rooms.length === 0 ? "bg-amber-50" : "bg-white"
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
        </div>
      </div>
    </div>
  );
}
