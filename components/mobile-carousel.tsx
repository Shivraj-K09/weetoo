"use client";

import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useRef, useState } from "react";
import { SparklesIcon, ThumbsUpIcon } from "lucide-react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": true,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      }`;

    script.onload = () => setIsLoading(false);
    script.onerror = () => {
      console.error("TradingView widget failed to load");
      setIsLoading(false);
    };

    if (container.current) {
      container.current.appendChild(script);
    }

    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="h-full mt-2 rounded-sm">
      {isLoading && (
        <div className="h-full w-full bg-gray-200 animate-pulse rounded-sm flex items-center justify-center">
          Loading chart...
        </div>
      )}
      <div
        className="tradingview-widget-container h-full"
        ref={container}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
          display: isLoading ? "none" : "block",
        }}
      >
        <div
          className="tradingview-widget-container__widget"
          style={{
            height: "calc(100% - 32px)",
            width: "100%",
            borderRadius: "0.5rem",
          }}
        ></div>
      </div>
    </div>
  );
}

function CarouselItemComponent({
  roomName,
  userName,
}: {
  roomName: string;
  userName: string;
}) {
  return (
    <div>
      <Card className="shadow-none rounded-md p-0 m-0 bg-white/50 border-none">
        <CardContent className="flex h-[20rem] p-0 m-0 py-2">
          <div className="flex flex-col items-center w-full h-full text-[#00044A]">
            <span className="text-sm font-semibold">{roomName}</span>
            <span className="text-[0.625rem]">{userName}</span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <SparklesIcon className="w-3.5 h-3.5 stroke-[#ffdb0c] fill-[#fcdf3b]" />
                <span className="text-xs">13</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUpIcon className="w-3.5 h-3.5 stroke-[#ffdb0c] fill-[#fcdf3b]" />
                <span className="text-xs">13</span>
              </div>
            </div>

            <div className="bg-[#7b7b7b] w-full py-2 mt-2 flex items-center gap-4 justify-center ">
              <div className="flex gap-1 text-white">
                <h4 className="text-[#2643ff] font-semibold">BUY</h4>
                <span>+ 163%</span>
              </div>

              <div className="flex gap-1 text-white">
                <h4 className="text-[#ff0000] font-semibold">SELL</h4>
                <span>+ 163%</span>
              </div>
            </div>

            <TradingViewWidget />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MobileCarousel() {
  const plugin = useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));

  return (
    <div className="flex justify-center items-center w-full py-3 pb-8 bg-[#284e5f]">
      <Carousel
        plugins={[plugin.current]}
        className="w-full max-w-[350px] relative"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      >
        <div className="absolute top-1/2 left-8 -translate-y-1/2 z-20 pointer-events-auto">
          <CarouselPrevious className="h-8 w-8 bg-white text-black" />
        </div>

        <div className="absolute top-1/2 right-8 -translate-y-1/2 z-20 pointer-events-auto">
          <CarouselNext className="h-8 w-8 bg-white text-black" />
        </div>

        <CarouselContent>
          <CarouselItem>
            <CarouselItemComponent
              roomName="ROOM NAME 1"
              userName="USER NAME 1"
            />
          </CarouselItem>
          <CarouselItem>
            <CarouselItemComponent
              roomName="ROOM NAME 2"
              userName="USER NAME 2"
            />
          </CarouselItem>
        </CarouselContent>
      </Carousel>
    </div>
  );
}
