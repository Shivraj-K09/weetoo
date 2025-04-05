"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LinkIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isHovered?: boolean;
}

const pathVariants: Variants = {
  normal: { pathLength: 1, pathOffset: 0, rotate: 0 },
  animate: {
    pathLength: [1, 0.97, 1, 0.97, 1],
    pathOffset: [0, 0.05, 0, 0.05, 0],
    rotate: [0, -5, 0],
    transition: {
      rotate: {
        duration: 0.5,
      },
      duration: 1,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: "easeInOut",
    },
  },
};

const LinkIcon = forwardRef<HTMLDivElement, LinkIconProps>(
  ({ className, size = 18, isHovered = false, ...props }, ref) => {
    const controls = useAnimation();

    useEffect(() => {
      if (isHovered) {
        controls.start("animate");
      } else {
        controls.start("normal");
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
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            variants={pathVariants}
            animate={controls}
          />
          <motion.path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            variants={pathVariants}
            animate={controls}
          />
        </svg>
      </div>
    );
  }
);

LinkIcon.displayName = "LinkIcon";

export { LinkIcon };
