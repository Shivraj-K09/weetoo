"use client";

import { Trading } from "@/components/trading";
import { TradingRooms } from "@/components/trading/trading-rooms";
import { TickerTape } from "react-ts-tradingview-widgets";

export default function Trader() {
  return (
    <div className="w-full flex flex-col">
      <div className="py-2">
        <TickerTape
          symbols={[
            { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
            { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
            { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
            { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
            { proName: "BITSTAMP:ETHUSD", title: "Ethereum" },
          ]}
          showSymbolLogo={true}
          isTransparent={true}
          displayMode="compact"
          colorTheme="light"
          locale="en"
        />
      </div>
      <Trading />
      <TradingRooms />
    </div>
  );
}
