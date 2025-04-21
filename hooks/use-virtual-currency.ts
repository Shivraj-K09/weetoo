"use client";

import { useState, useEffect } from "react";
import {
  getRoomVirtualCurrency,
  updateRoomVirtualCurrency,
} from "@/app/actions/virtual-currency-actions";
import { toast } from "sonner";

export function useVirtualCurrency(roomId: string, isOwner: boolean) {
  const [virtualCurrency, setVirtualCurrency] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch virtual currency on component mount
  useEffect(() => {
    if (!roomId || !isOwner) {
      setVirtualCurrency(0);
      setIsLoading(false);
      return;
    }

    const fetchVirtualCurrency = async () => {
      try {
        setIsLoading(true);
        const result = await getRoomVirtualCurrency(roomId);

        if (result.success) {
          setVirtualCurrency(result.amount);
        } else {
          console.error("Failed to get virtual currency:", result.message);
          // Don't show toast for permission errors (non-owners)
          if (
            result.message !== "Not authenticated" &&
            !(result.message ?? "").includes("permission")
          ) {
            toast.error("Failed to load virtual currency");
          }
        }
      } catch (error) {
        console.error("Error fetching virtual currency:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVirtualCurrency();
  }, [roomId, isOwner]);

  // Function to update virtual currency
  const updateVirtualCurrency = async (newAmount: number) => {
    if (!roomId || !isOwner) {
      toast.error("Only room owner can update virtual currency");
      return false;
    }

    try {
      const result = await updateRoomVirtualCurrency(roomId, newAmount);

      if (result.success) {
        setVirtualCurrency(newAmount);
        return true;
      } else {
        toast.error(result.message || "Failed to update virtual currency");
        return false;
      }
    } catch (error) {
      console.error("Error updating virtual currency:", error);
      toast.error("Failed to update virtual currency");
      return false;
    }
  };

  // Function to add to virtual currency
  const addVirtualCurrency = async (amount: number) => {
    return await updateVirtualCurrency(virtualCurrency + amount);
  };

  // Function to subtract from virtual currency
  const subtractVirtualCurrency = async (amount: number) => {
    const newAmount = Math.max(0, virtualCurrency - amount);
    return await updateVirtualCurrency(newAmount);
  };

  return {
    virtualCurrency,
    isLoading,
    updateVirtualCurrency,
    addVirtualCurrency,
    subtractVirtualCurrency,
  };
}
