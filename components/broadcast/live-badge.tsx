"use client";

import { useState, useEffect } from "react";

interface LiveBadgeProps {
  isLive: boolean;
}

export default function LiveBadge({ isLive }: LiveBadgeProps) {
  const [visible, setVisible] = useState(false);

  // Add a slight delay before showing the badge for a nice fade-in effect
  useEffect(() => {
    if (isLive) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [isLive]);

  if (!isLive) return null;

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
      Live
    </span>
  );
}
