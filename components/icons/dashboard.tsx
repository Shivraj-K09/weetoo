"use client";

import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isHovered?: boolean;
}

const DashboardIcon = forwardRef<HTMLDivElement, DashboardIconProps>(
  ({ className, size = 18, isHovered = false, ...props }, ref) => {
    const controls = useAnimation();

    useEffect(() => {
      if (isHovered) {
        controls.start({
          translateY: 3,
          translateX: 0.5,
          rotate: 72,
          transition: {
            duration: 0.3,
            type: "spring",
            stiffness: 160,
            damping: 17,
          },
        });
      } else {
        controls.start({
          translateY: 0,
          translateX: 0,
          rotate: 0,
          transition: {
            duration: 0.3,
            type: "spring",
            stiffness: 160,
            damping: 17,
          },
        });
      }
    }, [isHovered, controls]);

    return (
      <div
        ref={ref}
        className={cn(`flex items-center justify-center`, className)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="m12 14 4-4"
            animate={controls}
            style={{ originX: "50%", originY: "50%" }}
          />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      </div>
    );
  }
);

DashboardIcon.displayName = "DashboardIcon";

export { DashboardIcon };
