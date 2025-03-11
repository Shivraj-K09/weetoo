"use client";

import { MobileCarousel } from "./mobile-carousel";

export function MobileContent() {
  return (
    <div className="h-full flex flex-col w-full lg:hidden">
      <div className="py-3 bg-[#0f2229] text-center text-white">
        <span className="font-semibold uppercase">Top 5 Profilt</span>
      </div>

      <MobileCarousel />
    </div>
  );
}
