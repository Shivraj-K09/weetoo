"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, RefreshCw } from "lucide-react";

export function RefundFee() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="w-full rounded-xl overflow-hidden border border-gray-200 bg-white">
      {/* Simple professional header with site theme color */}
      <div className="bg-[#c74135] px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">환급 수수료</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs text-white/80">Live</span>
          </div>
          <button className="text-white/70 hover:text-white cursor-pointer">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3">
        {/* Simple exchange rate display */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 text-center mb-2">
            다른 사람들은 얼마만큼 수수료 환급받았?
          </p>

          {/* Clean exchange rate card with theme colors */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">
                  Total Refund Amount
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#c74135]">
                    1,326,794
                  </span>
                  <span className="text-sm text-gray-500">KRW</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-600">
                  +12.5%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional action button with theme color */}
        <Button
          className="w-full py-2.5 bg-[#c74135] hover:bg-[#b33a2f] text-white rounded-lg flex items-center justify-center cursor-pointer h-10"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <span>나도 예상 환급액 조회하기</span>
          <ArrowRight
            className={`ml-2 h-4 w-4 transition-transform duration-300 ${
              isHovering ? "translate-x-0.5" : ""
            }`}
          />
        </Button>
      </div>
    </section>
  );
}
