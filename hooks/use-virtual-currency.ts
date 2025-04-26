"use client";

import { useState, useEffect } from "react";
import {
  getRoomVirtualCurrency,
  updateRoomVirtualCurrency,
} from "@/app/actions/virtual-currency-actions";
import { toast } from "sonner";

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

export function useVirtualCurrency(roomId: string, isOwner: boolean) {
  const [virtualCurrency, setVirtualCurrency] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch virtual currency on component mount
  useEffect(() => {
    console.log(
      "[useVirtualCurrency] Effect running with roomId:",
      roomId,
      "isOwner:",
      isOwner
    );

    if (!roomId || !isOwner) {
      console.log(
        "[useVirtualCurrency] No roomId or not owner, setting currency to 0"
      );
      setVirtualCurrency(0);
      setIsLoading(false);
      return;
    }

    const fetchVirtualCurrency = async () => {
      try {
        console.log(
          "[useVirtualCurrency] Fetching virtual currency for roomId:",
          roomId
        );
        setIsLoading(true);
        const result = await getRoomVirtualCurrency(roomId);

        if (result.success) {
          console.log(
            "[useVirtualCurrency] Successfully fetched virtual currency:",
            result.amount
          );
          setVirtualCurrency(result.amount);
        } else {
          console.error(
            "[useVirtualCurrency] Failed to get virtual currency:",
            result.message
          );
          // Don't show toast for permission errors (non-owners)
          if (
            (result.message ?? "") !== "Not authenticated" &&
            !(result.message ?? "").includes("permission")
          ) {
            toast.error("Failed to load virtual currency");
          }
        }
      } catch (error) {
        console.error(
          "[useVirtualCurrency] Error fetching virtual currency:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchVirtualCurrency();
  }, [roomId, isOwner]);

  // Function to update virtual currency
  const updateVirtualCurrency = async (newAmount: number): Promise<boolean> => {
    try {
      console.log(
        "[useVirtualCurrency] Updating virtual currency to:",
        newAmount
      );
      const result = await updateRoomVirtualCurrency(roomId, newAmount);

      if (result.success) {
        console.log(
          "[useVirtualCurrency] Successfully updated virtual currency"
        );
        setVirtualCurrency(newAmount);
        return true;
      } else {
        console.error(
          "[useVirtualCurrency] Failed to update virtual currency:",
          result.message
        );
        toast.error(result.message || "Failed to update virtual currency");
        return false;
      }
    } catch (error) {
      console.error(
        "[useVirtualCurrency] Error updating virtual currency:",
        error
      );
      toast.error("An error occurred while updating virtual currency");
      return false;
    }
  };

  // Function to add to virtual currency
  const addVirtualCurrency = async (amount: number): Promise<boolean> => {
    console.log("[useVirtualCurrency] Adding to virtual currency:", amount);
    return updateVirtualCurrency(virtualCurrency + amount);
  };

  // Function to subtract from virtual currency
  const subtractVirtualCurrency = async (amount: number): Promise<boolean> => {
    console.log(
      "[useVirtualCurrency] Subtracting from virtual currency:",
      amount
    );
    if (virtualCurrency < amount) {
      toast.error("Insufficient virtual currency");
      return false;
    }
    return updateVirtualCurrency(virtualCurrency - amount);
  };

  return {
    virtualCurrency,
    isLoading,
    updateVirtualCurrency,
    addVirtualCurrency,
    subtractVirtualCurrency,
  };
}
