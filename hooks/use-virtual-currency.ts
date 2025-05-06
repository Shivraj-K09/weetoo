"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  getVirtualCurrencyBalance,
  getVirtualCurrencyBalanceAsync,
} from "@/utils/get-virtual-currency";

export function useVirtualCurrency(roomId: string, isOwner = false) {
  const [virtualCurrency, setVirtualCurrency] = useState<number>(
    getVirtualCurrencyBalance(roomId)
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch virtual currency on mount
  useEffect(() => {
    const fetchVirtualCurrency = async () => {
      try {
        setIsLoading(true);

        // Get the detailed balance
        const balanceInfo = await getVirtualCurrencyBalanceAsync(roomId);

        // Update state with available balance
        setVirtualCurrency(balanceInfo.availableBalance);
      } catch (error) {
        console.error("Error fetching virtual currency:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVirtualCurrency();

    // Set up real-time subscription for virtual currency changes
    const channel = supabase
      .channel(`virtual_currency_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "virtual_currency",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: {
          new: { amount?: number } | Record<string, any> | null;
          old: Record<string, any> | null;
        }) => {
          console.log("Virtual currency changed:", payload);
          // Use type assertion to tell TypeScript that amount exists
          if (
            payload.new &&
            "amount" in payload.new &&
            typeof payload.new.amount === "number"
          ) {
            setVirtualCurrency(payload.new.amount);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Update virtual currency
  const updateVirtualCurrency = useCallback(
    async (newAmount: number) => {
      try {
        // Only allow updates if user is the owner
        if (!isOwner) {
          console.warn("Non-owner attempted to update virtual currency");
          return false;
        }

        const { error } = await supabase
          .from("virtual_currency")
          .upsert({ room_id: roomId, amount: newAmount });

        if (error) {
          console.error("Error updating virtual currency:", error);
          return false;
        }

        setVirtualCurrency(newAmount);
        return true;
      } catch (error) {
        console.error("Error updating virtual currency:", error);
        return false;
      }
    },
    [roomId, isOwner]
  );

  // Add to virtual currency
  const addVirtualCurrency = useCallback(
    async (amount: number) => {
      try {
        // Only allow updates if user is the owner
        if (!isOwner) {
          console.warn("Non-owner attempted to add virtual currency");
          return false;
        }

        const newAmount = virtualCurrency + amount;
        return await updateVirtualCurrency(newAmount);
      } catch (error) {
        console.error("Error adding virtual currency:", error);
        return false;
      }
    },
    [virtualCurrency, updateVirtualCurrency, isOwner]
  );

  // Subtract from virtual currency
  const subtractVirtualCurrency = useCallback(
    async (amount: number) => {
      try {
        // Only allow updates if user is the owner
        if (!isOwner) {
          console.warn("Non-owner attempted to subtract virtual currency");
          return false;
        }

        if (amount > virtualCurrency) {
          console.warn("Attempted to subtract more than available");
          return false;
        }

        const newAmount = virtualCurrency - amount;
        return await updateVirtualCurrency(newAmount);
      } catch (error) {
        console.error("Error subtracting virtual currency:", error);
        return false;
      }
    },
    [virtualCurrency, updateVirtualCurrency, isOwner]
  );

  // Get virtual currency balance (returns an object with balance details)
  const getBalance = useCallback(async () => {
    try {
      const balanceInfo = await getVirtualCurrencyBalanceAsync(roomId);
      return balanceInfo;
    } catch (error) {
      console.error("Error getting virtual currency balance:", error);
      return {
        availableBalance: virtualCurrency,
        totalBalance: virtualCurrency,
        lockedBalance: 0,
      };
    }
  }, [roomId, virtualCurrency]);

  return {
    virtualCurrency,
    isLoading,
    updateVirtualCurrency,
    addVirtualCurrency,
    subtractVirtualCurrency,
    getVirtualCurrencyBalance: getBalance,
  };
}
