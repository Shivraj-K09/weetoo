"use client";

import { useState, useEffect } from "react";
import { HardHat } from "lucide-react";

export function AdminUnderConstruction() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <div
        className={`max-w-md w-full transition-all duration-700 ease-out ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full bg-yellow-500/20 animate-ping"
                style={{ animationDuration: "3s" }}
              ></div>
              <div className="relative bg-yellow-500 text-slate-900 rounded-full p-3">
                <HardHat size={28} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Admin Dashboard
          </h1>

          <div className="flex items-center justify-center gap-2 text-yellow-500 mb-2">
            <span className="text-sm font-medium uppercase tracking-wider">
              Under Construction
            </span>
          </div>

          <p className="text-slate-300 max-w-sm mx-auto mb-8">
            We're building a powerful admin experience. Check back soon to see
            our progress.
          </p>
        </div>

        {/* Construction imagery - created with CSS instead of an external image */}
        <div
          className={`relative w-full h-64 rounded-lg overflow-hidden mb-8 transition-all duration-1000 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Construction background */}
          <div className="absolute inset-0 bg-slate-700 grid grid-cols-6 grid-rows-6 gap-1 p-2">
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className="bg-slate-600 rounded-sm"
                style={{
                  opacity: Math.random() * 0.5 + 0.25,
                }}
              ></div>
            ))}
          </div>

          {/* Overlay with construction elements */}
          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Construction tape effect */}
              <div className="absolute top-1/4 w-full h-12 bg-yellow-400/90 -rotate-6 flex items-center justify-center transform">
                <span className="text-slate-900 font-bold tracking-wider text-lg uppercase">
                  Under Construction
                </span>
              </div>

              <div className="absolute bottom-1/4 w-full h-12 bg-yellow-400/90 rotate-6 flex items-center justify-center transform">
                <span className="text-slate-900 font-bold tracking-wider text-lg uppercase">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Your Company</p>
        </div>
      </div>
    </div>
  );
}
