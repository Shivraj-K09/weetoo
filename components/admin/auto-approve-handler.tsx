"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function AutoApproveHandler() {
  const pathname = usePathname();
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Only run on the admin manage posts page
    if (pathname !== "/admin/manage-posts") return;

    // Function to call the auto-approve API
    const checkAndAutoApprovePosts = async () => {
      try {
        console.log("Checking for posts to auto-approve...");
        const response = await fetch("/api/admin/auto-approve");

        if (!response.ok) {
          console.error("Failed to auto-approve posts:", await response.text());
          return;
        }

        const result = await response.json();
        console.log("Auto-approve API response:", result);

        if (result.approvedPosts?.length > 0) {
          console.log(`Auto-approved ${result.approvedPosts.length} posts`);
          toast.success(`Auto-approved ${result.approvedPosts.length} posts`);
          // Force a refresh of the page to show the updated status
          window.location.reload();
        }

        setLastChecked(new Date());
      } catch (error) {
        console.error("Error auto-approving posts:", error);
      }
    };

    // Call immediately when the component mounts
    checkAndAutoApprovePosts();

    // Set up an interval to check every 30 seconds
    const interval = setInterval(checkAndAutoApprovePosts, 30000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [pathname]);

  return null; // This component doesn't render anything
}
