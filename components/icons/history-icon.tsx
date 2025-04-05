"use client";

import type { Transition, Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HistoryIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  isHovered?: boolean;
}

const arrowTransition: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

const arrowVariants: Variants = {
  normal: {
    rotate: "0deg",
  },
  animate: {
    rotate: "-50deg",
  },
};

const handTransition: Transition = {
  duration: 0.6,
  ease: [0.4, 0, 0.2, 1],
};

const handVariants: Variants = {
  normal: {
    rotate: 0,
    originX: "50%",
    originY: "50%",
  },
  animate: {
    rotate: -360,
  },
};

const minuteHandTransition: Transition = {
  duration: 0.5,
  ease: "easeInOut",
};

const minuteHandVariants: Variants = {
  normal: {
    rotate: 0,
    originX: "50%",
    originY: "50%",
  },
  animate: {
    rotate: -45,
  },
};

const HistoryIcon = forwardRef<HTMLDivElement, HistoryIconProps>(
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
          <motion.g
            transition={arrowTransition}
            variants={arrowVariants}
            animate={controls}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </motion.g>
          <motion.line
            x1="12"
            y1="12"
            x2="12"
            y2="7"
            variants={handVariants}
            animate={controls}
            initial="normal"
            transition={handTransition}
          />
          <motion.line
            x1="12"
            y1="12"
            x2="16"
            y2="14"
            variants={minuteHandVariants}
            animate={controls}
            initial="normal"
            transition={minuteHandTransition}
          />
        </svg>
      </div>
    );
  }
);

HistoryIcon.displayName = "HistoryIcon";

export { HistoryIcon };
