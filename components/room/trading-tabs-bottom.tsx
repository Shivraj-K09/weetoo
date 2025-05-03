"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionsPanel } from "./position-panel";
import { TradeHistory } from "./trade-history";
import { FundingHistory } from "./funding-history";
import { useUser } from "@/hooks/use-user";

interface TradingTabsBottomProps {
  roomId: string;
  isHost: boolean;
  symbol: string;
  currentPrice: number;
  virtualCurrency: string;
  connectionStatus?: "connected" | "connecting" | "disconnected";
}

export function TradingTabsBottom({
  roomId,
  isHost,
  symbol,
  currentPrice,
  virtualCurrency,
  connectionStatus = "connected",
}: TradingTabsBottomProps) {
  const [activeTab, setActiveTab] = useState("positions");
  const { user } = useUser();

  return (
    <Tabs
      defaultValue="positions"
      className="w-full h-full"
      onValueChange={setActiveTab}
    >
      <div className="border-b border-[#3f445c]">
        <TabsList className="bg-transparent">
          <TabsTrigger
            value="positions"
            className={`data-[state=active]:bg-[#3f445c] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#E74C3C] transition-none`}
          >
            Positions
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className={`data-[state=active]:bg-[#3f445c] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#E74C3C] transition-none`}
          >
            Trade History
          </TabsTrigger>
          <TabsTrigger
            value="funding"
            className={`data-[state=active]:bg-[#3f445c] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-[#E74C3C] transition-none`}
          >
            Funding History
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent
        value="positions"
        className="h-[calc(100%-40px)] overflow-y-auto no-scrollbar"
      >
        <PositionsPanel
          roomId={roomId}
          currentPrice={currentPrice}
          hideTitle={true}
          symbol={symbol}
          hostId={isHost ? undefined : roomId.split("-")[0]}
          connectionStatus={connectionStatus}
        />
      </TabsContent>
      <TabsContent
        value="history"
        className="h-[calc(100%-40px)] overflow-y-auto no-scrollbar"
      >
        <TradeHistory roomId={roomId} />
      </TabsContent>
      <TabsContent
        value="funding"
        className="h-[calc(100%-40px)] overflow-y-auto no-scrollbar"
      >
        <FundingHistory roomId={roomId} userId={user?.id || ""} />
      </TabsContent>
    </Tabs>
  );
}
