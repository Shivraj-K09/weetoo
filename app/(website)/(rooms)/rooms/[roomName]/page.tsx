"use client";

import { TradingMarketPlace } from "@/components/room/trading-market-place";
import { TradingTabs } from "@/components/room/trading-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ZapIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Define privacy type as a union type for better type safety
type Privacy = "private" | "public";

// Define the room details type
interface RoomDetails {
  symbol: string;
  privacy: Privacy;
}

// Define the Room type
interface Room {
  symbol: string;
  privacy: Privacy;
}

// Get room details from localStorage
const getRoomDetails = (roomId: string): RoomDetails => {
  if (typeof window !== "undefined") {
    try {
      const roomsDetails = JSON.parse(
        localStorage.getItem("roomsDetails") || "{}"
      );
      const details = roomsDetails[roomId];

      if (details) {
        // Validate privacy value
        if (details.privacy !== "private" && details.privacy !== "public") {
          console.warn("Invalid privacy value in storage:", details.privacy);
          details.privacy = "private"; // Default to private if invalid
        }
        return details as RoomDetails;
      }
    } catch (e) {
      console.error("Error getting room details:", e);
    }
  }
  return { symbol: "BTCUSDT", privacy: "private" };
};

export default function RoomPage() {
  const params = useParams();
  const roomNameParam = params.roomName as string;
  const container = useRef<HTMLDivElement>(null);

  // Extract room ID and name from the URL
  // const [roomId, ...roomNameParts] = roomNameParam.split("-");
  const [roomId] = roomNameParam.split("-");
  // const roomName = roomNameParts.join("-");

  // State for the room details
  const [roomDetails, setRoomDetails] = useState<Room>({
    symbol: "BTCUSDT",
    privacy: "private",
  });

  // Get room details from localStorage
  useEffect(() => {
    const roomDetails = getRoomDetails(roomId);
    console.log("Room details:", roomDetails);
    setRoomDetails(roomDetails);
  }, [roomId]);

  // Check if it is a private room
  // const isPrivate = roomDetails.privacy === "private";

  // Format room title from the room name
  // const title = roomName
  //   ? roomName.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  //   : "Untitled Room";

  useEffect(() => {
    // Capture the container element once
    const containerEl = container.current;
    if (!containerEl) return;

    // Clear any existing content
    containerEl.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
            {
              "autosize": true,
              "symbol": "${roomDetails.symbol}",
              "interval": "D",
              "timezone": "Asia/Seoul",
              "theme": "dark",
              "style": "1",
              "locale": "kr",
              "withdateranges": true,
              "hide_side_toolbar": false,
              "backgroundColor": "rgba(33, 38, 49, 1)",
              "gridColor": "rgba(33, 38, 49, 1)",
              "allow_symbol_change": true,
              "calendar": false,
              "support_host": "https://www.tradingview.com"
            }`;

    containerEl.appendChild(script);

    // Cleanup function
    return () => {
      containerEl.innerHTML = "";
    };
  }, [roomDetails.symbol]); // Only re-run when symbol changes

  const records = Array(12).fill({
    date: "2025-03-10",
    action: "BUY",
    percentage: "+20%",
  });

  return (
    <div className="h-full overflow-y-auto no-scrollbar">
      <div className="p-4 w-full flex gap-1.5 bg-[#181a20]">
        <div className="h-full text-white rounded-md shadow-sm flex-1 w-full">
          <div className="flex flex-col gap-1.5">
            <div className="p-4 border rounded h-26"></div>

            <div className=" bg-[#212631] rounded-md w-full">
              <div className="border w-full border-[#3f445c] text-white rounded p-4 flex items-center bg-[#1a1e27]">
                <div className="flex flex-col gap-1.5">
                  <Select defaultValue="BTCUSDT">
                    <SelectTrigger className="text-white rounded h-7 border-[#494f6b] border min-w-[8rem]">
                      <SelectValue
                        placeholder="Select a symbol"
                        className="text-white"
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-[#212631] text-white border-[#494f6b]">
                      <SelectItem value="BTCUSDT">BTCUSDT</SelectItem>
                      <SelectItem value="ETHUSDT">ETHUSDT</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-white/75 text-[0.9rem]">
                    USDT Futures Trading
                  </span>
                </div>
                <div className="mx-5 h-15">
                  <Separator
                    className="w-full bg-[#3f445c]"
                    orientation="vertical"
                  />
                </div>

                <div className="flex items-center gap-9.5">
                  <div className="flex items-center gap-1.5 flex-col">
                    <span className="text-sm">19,000.00</span>
                    <span className="text-sm border-b border-dotted text-white/75">
                      10,000.00
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">인덱스가격</span>
                    <span className="text-sm">10,000.00</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">변경률(24H)</span>
                    <span className="text-sm text-red-500">
                      -1017.20(-1.22%) %
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">최고가(24H)</span>
                    <span className="text-sm">10,000.00</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">최저가(24H)</span>
                    <span className="text-sm">10,000.00</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">
                      턴오버(24H/USDT)
                    </span>
                    <span className="text-sm">8,916,009,664.28</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">
                      거래량(24H/BTC)
                    </span>
                    <span className="text-sm">109,176</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-sm">미결제약정(24H/BTC)</span>
                    <span className="text-sm">47,614.027</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-xs text-white/75">
                      펀딩율 / 남은시간
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-orange-500 flex items-center gap-1.5">
                        <ZapIcon className="w-4 h-4" />
                        0.0025%{" "}
                      </span>
                      /<span className="text-sm">01:22:26</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-1.5 w-full ">
              {/* Trading Chart */}
              <div className="bg-[#212631] rounded w-full h-[45rem] border border-[#3f445c]">
                <div
                  className="tradingview-widget-container"
                  ref={container}
                  style={{ height: "100%", width: "100%" }}
                >
                  <div
                    className="tradingview-widget-container__widget"
                    style={{ height: "calc(100% - 32px)", width: "100%" }}
                  ></div>
                </div>
              </div>
              {/* Tabs */}
              <div className="bg-[#212631] p-1 rounded max-w-[290px] w-full h-[45rem] border border-[#3f445c]">
                <TradingTabs />
              </div>

              <TradingMarketPlace />
            </div>

            <div className="bg-[#212631] w-full h-[12rem] border border-[#3f445c]"></div>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-[19rem]  rounded-md text-white flex flex-col gap-1.5">
          <div className="w-full bg-[#212631] h-fit p-4 py-3 text-sm border border-[#3f445c]">
            <div className="w-full bg-[#212631] rounded">
              <div className="flex justify-between text-sm mb-2 text-gray-400">
                <div>Record</div>
                <div>Viewers</div>
              </div>
              <div className="space-y-2">
                {records.map((record, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 items-center w-full"
                  >
                    <div className="text-gray-300 leading-tight">
                      <div>2025-03-10</div>
                    </div>
                    <span className="text-[#007AFF] text-center">
                      {record.action}
                    </span>
                    <span className="text-gray-300 text-right">
                      {record.percentage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-[#212631] h-full relative border border-[#3f445c]">
            <div className="bg-[#1a1e27] flex items-center justify-between w-full p-2">
              <div className="text-sm">
                Users Online: <span>31</span>
              </div>
              <span className="text-xs">채팅방 규정</span>
            </div>
            <div className="flex-1"></div>
            <div className="absolute w-full px-2 bottom-2">
              <div className="relative">
                <Input
                  placeholder="Please Login to chat"
                  className="rounded-none border-[#3f445c] text-white/70 text-sm focus-visible:ring-0 selection:bg-[#f97316] selection:text-white"
                />
                <Button
                  variant="outline"
                  className="absolute right-0 top-0 h-full rounded-none border bg-transparent cursor-pointer"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>

          <div className="h-[25rem]"></div>
        </div>
      </div>
    </div>
  );
}

{
  /* <div className="mb-6">
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Trading Rooms
          </Button>
        </Link>
      </div> */
}
