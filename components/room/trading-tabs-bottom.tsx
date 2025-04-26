"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PositionsPanel } from "./position-panel";
import { TradeHistory } from "./trade-history";

interface TradingTabsBottomProps {
  roomId: string;
  currentPrice: number;
  isHost: boolean;
  symbol: string;
}

export function TradingTabsBottom({
  roomId,
  currentPrice,
  isHost,
  symbol,
}: TradingTabsBottomProps) {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <Tabs
      defaultValue="positions"
      className="w-full bg-[#212631] border border-[#3f445c] h-[10px]"
      onValueChange={setActiveTab}
    >
      <TabsList className="bg-[#1a1e27] border-b border-[#3f445c] w-full rounded-t-md rounded-b-none h-10">
        <TabsTrigger value="positions" className="border-none h-10">
          Open Positions
        </TabsTrigger>
        <TabsTrigger value="history" className="border-none h-10">
          Trade History
        </TabsTrigger>
      </TabsList>
      <TabsContent value="positions" className="p-0">
        <PositionsPanel
          roomId={roomId}
          currentPrice={Number(currentPrice)}
          symbol={symbol}
          hideTitle={true}
        />
      </TabsContent>
      <TabsContent value="history" className="p-0">
        <TradeHistory roomId={roomId} />
      </TabsContent>
    </Tabs>
  );
}
