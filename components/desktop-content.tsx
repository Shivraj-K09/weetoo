"use client";

import Image from "next/image";
import { TickerTape } from "react-ts-tradingview-widgets";
import { Community } from "./community/community";
import { Ranking } from "./community/ranking";
import { Trading } from "./trading";

export function DesktopContent() {
  return (
    <div className="font-[family-name:var(--font-geist-sans)] w-full h-full lg:block hidden">
      <div className="h-full">
        <Image
          src="/banner.png"
          alt="banner"
          width={1000}
          height={250}
          draggable={false}
          className="w-full rounded-md"
        />
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

        <div className="flex flex-col gap-2">
          <Community />
          <Ranking />
        </div>

        <Trading />
      </div>
    </div>
  );
}
