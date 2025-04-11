"use client";

import { useEffect } from "react";
import { incrementPostView } from "@/app/actions/post-actions";

interface ViewCounterProps {
  postId: string;
}

export default function ViewCounter({ postId }: ViewCounterProps) {
  useEffect(() => {
    // Only increment the view count once when the component mounts
    incrementPostView(postId);
  }, [postId]);

  // This component doesn't render anything visible
  return null;
}
