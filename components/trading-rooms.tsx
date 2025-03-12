import { useState } from "react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { XIcon } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function TradingRooms() {
  const [open, setOpen] = useState(false);

  // Create an array of 9 items to match the original layout
  const skeletonItems = Array.from({ length: 9 }, (_, i) => i + 1);

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
              <div className="space-y-2 p-4">
                <Input
                  placeholder="방제목을 입력해 주세요."
                  className="rounded w-full shadow-none h-10"
                />

                <Select>
                  <SelectTrigger className="rounded w-full shadow-none h-10">
                    <SelectValue placeholder="BTCUSDT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btcusdt">BTCUSDT</SelectItem>
                    <SelectItem value="ethusdt">ETHUSDT</SelectItem>
                    <SelectItem value="bnbusdt">BNBUSDT</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="rounded w-full shadow-none h-10">
                    <SelectValue placeholder="비공개방" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">비공개방</SelectItem>
                    <SelectItem value="public">공개방</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="비밀번호를 입력해 주세요"
                  type="password"
                  className="rounded w-full shadow-none h-10"
                />

                {/* Price Info */}
                <div className="text-right text-xs text-[#E74C3C] font-medium pt-5">
                  6,900,000 KOR_COIN
                </div>

                {/* Submit Button */}
                <Button className="w-full bg-[#E74C3C] mt-2 hover:bg-[#E74C3C]/90 text-white font-medium rounded shadow-none h-12">
                  1,000 KOR_COIN
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full border-2 border-amber-500 rounded-sm overflow-hidden shadow-md bg-white">
        <div className="overflow-y-auto max-h-[600px]">
          {skeletonItems.map((index) => (
            <div
              key={index}
              className={`flex items-center border-b border-gray-200 py-3 px-2 ${
                index === 1 ? "bg-amber-50" : "bg-white"
              } relative`}
            >
              {/* Hanging Medal Skeleton (only for first and last items) */}
              {(index === 1 || index === 9) && (
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

              {/* Special badges Skeleton */}
              {/* {(index === 1 || index === 9) && (
              <div className="ml-1 bg-red-200 rounded-full w-5 h-5 animate-pulse" />
            )} */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
