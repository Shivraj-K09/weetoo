"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NotificationIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isHovered?: boolean;
}

const svgVariants: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -10, 10, -10, 0] },
};

const NotificationIcon = forwardRef<HTMLDivElement, NotificationIconProps>(
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
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={svgVariants}
          animate={controls}
          transition={{
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </motion.svg>
      </div>
    );
  }
);

NotificationIcon.displayName = "NotificationIcon";

export { NotificationIcon };
