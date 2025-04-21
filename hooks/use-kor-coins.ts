"use client";

import { useState, useEffect } from "react";
import { getUserKorCoins } from "@/app/actions/donate-actions";

export function useKorCoins() {
  const [korCoins, setKorCoins] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch KOR_COINS on component mount
  useEffect(() => {
    const fetchKorCoins = async () => {
      try {
        setIsLoading(true);
        const result = await getUserKorCoins();

        if (result.success) {
          setKorCoins(result.amount);
        } else {
          console.error("Failed to get KOR_COINS:", result.message);
        }
      } catch (error) {
        console.error("Error fetching KOR_COINS:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKorCoins();
  }, []);

  return {
    korCoins,
    isLoading,
    setKorCoins, // Allow updating the local state after a donation
  };
}
