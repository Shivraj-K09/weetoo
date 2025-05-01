"use server";

import { createClient } from "@/lib/supabase/server";

// Types for Binance API responses
type BinanceFundingRateInfo = {
  symbol: string;
  markPrice: string;
  indexPrice: string;
  estimatedSettlePrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
  interestRate: string;
  time: number;
};

/**
 * Fetches current funding rates from Binance for all active trading pairs
 * This function is designed to be called when users visit trading pages
 */
export async function fetchAndStoreFundingRates() {
  console.log("[fetchAndStoreFundingRates] Starting funding rate fetch");
  const startTime = Date.now();

  try {
    // Step 1: Get the Supabase client
    const supabase = await createClient();

    // Step 2: Check when we last fetched rates to avoid excessive API calls
    const { data: lastFetch, error: lastFetchError } = await supabase
      .from("funding_rates")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1);

    // Only fetch new rates if it's been more than 30 minutes since the last fetch
    // This prevents excessive API calls when multiple users visit the site
    if (!lastFetchError && lastFetch && lastFetch.length > 0) {
      const lastFetchTime = new Date(lastFetch[0].created_at).getTime();
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

      if (lastFetchTime > thirtyMinutesAgo) {
        console.log(
          "[fetchAndStoreFundingRates] Skipping fetch - last fetch was less than 30 minutes ago"
        );
        return {
          success: true,
          message: "Skipped - recent fetch exists",
          skipped: true,
        };
      }
    }

    // Step 3: Get all unique trading pairs from active rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from("trading_rooms")
      .select("trading_pairs");

    if (roomsError) {
      console.error(
        "[fetchAndStoreFundingRates] Error fetching rooms:",
        roomsError
      );
      return { success: false, error: roomsError.message };
    }

    // Step 4: Extract unique symbols from the rooms data
    // The trading_pairs column contains arrays like ["BTCUSDT"]
    const allPairs = roomsData.flatMap((room) => room.trading_pairs || []);
    const uniquePairs = [...new Set(allPairs)];

    console.log(
      `[fetchAndStoreFundingRates] Found ${uniquePairs.length} unique trading pairs:`,
      uniquePairs
    );

    if (uniquePairs.length === 0) {
      console.log(
        "[fetchAndStoreFundingRates] No trading pairs found, skipping fetch"
      );
      return { success: true, message: "No trading pairs to fetch" };
    }

    // Step 5: Fetch funding rates from Binance
    // We'll use the premiumIndex endpoint which gives us all the data we need
    const binanceUrl = "https://fapi.binance.com/fapi/v1/premiumIndex";
    console.log(
      `[fetchAndStoreFundingRates] Fetching from Binance: ${binanceUrl}`
    );

    const response = await fetch(binanceUrl);
    if (!response.ok) {
      console.error(
        `[fetchAndStoreFundingRates] Binance API error: ${response.status} ${response.statusText}`
      );
      return { success: false, error: `Binance API error: ${response.status}` };
    }

    const allFundingData: BinanceFundingRateInfo[] = await response.json();
    console.log(
      `[fetchAndStoreFundingRates] Received data for ${allFundingData.length} symbols from Binance`
    );

    // Step 6: Filter to only include the symbols we care about
    const relevantFundingData = allFundingData.filter((item) =>
      uniquePairs.includes(item.symbol)
    );

    console.log(
      `[fetchAndStoreFundingRates] Filtered to ${relevantFundingData.length} relevant symbols`
    );

    // Step 7: Prepare the data for insertion into our database
    const fundingRatesToInsert = relevantFundingData.map((item) => ({
      symbol: item.symbol,
      funding_rate: Number.parseFloat(item.lastFundingRate),
      mark_price: Number.parseFloat(item.markPrice),
      index_price: Number.parseFloat(item.indexPrice),
      next_funding_time: new Date(item.nextFundingTime).toISOString(),
      created_at: new Date().toISOString(),
    }));

    // Step 8: Insert the funding rates into our database using the regular client
    // This works because we've updated the RLS policies to allow authenticated users to insert
    const { error: insertError } = await supabase
      .from("funding_rates")
      .insert(fundingRatesToInsert);

    if (insertError) {
      console.error(
        "[fetchAndStoreFundingRates] Error inserting funding rates:",
        insertError
      );
      return { success: false, error: insertError.message };
    }

    const duration = Date.now() - startTime;
    console.log(
      `[fetchAndStoreFundingRates] Successfully stored ${fundingRatesToInsert.length} funding rates in ${duration}ms`
    );

    return {
      success: true,
      count: fundingRatesToInsert.length,
      symbols: fundingRatesToInsert.map((item) => item.symbol),
    };
  } catch (error) {
    console.error("[fetchAndStoreFundingRates] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Gets the latest funding rate for a specific symbol
 * Used by the UI to display current funding rates
 */
export async function getLatestFundingRate(symbol: string) {
  try {
    const supabase = await createClient();

    // First, try to fetch the latest funding rate
    const { data, error } = await supabase
      .from("funding_rates")
      .select("*")
      .eq("symbol", symbol)
      .order("created_at", { ascending: false })
      .limit(1);

    // If no data exists yet, fetch it now
    if ((error || !data || data.length === 0) && symbol) {
      console.log(
        `[getLatestFundingRate] No funding rate found for ${symbol}, fetching now`
      );

      // Trigger a fetch from Binance
      await fetchAndStoreFundingRates();

      // Try again after fetching
      const { data: newData, error: newError } = await supabase
        .from("funding_rates")
        .select("*")
        .eq("symbol", symbol)
        .order("created_at", { ascending: false })
        .limit(1);

      if (newError || !newData || newData.length === 0) {
        console.error(
          `[getLatestFundingRate] Still no data for ${symbol} after fetch:`,
          newError || "No data"
        );

        // Return a default value if we still can't get data
        return {
          success: true,
          data: {
            symbol: symbol,
            funding_rate: 0.0001, // Default small positive rate
            mark_price: 0,
            index_price: 0,
            next_funding_time: new Date(
              Math.floor(Date.now() / 28800000 + 1) * 28800000
            ).toISOString(), // Next 8-hour mark
            created_at: new Date().toISOString(),
          },
        };
      }

      return { success: true, data: newData[0] };
    }

    if (error) {
      console.error(
        `[getLatestFundingRate] Error fetching rate for ${symbol}:`,
        error
      );
      return { success: false, error: error.message };
    }

    // If we have data, return the first item
    if (data && data.length > 0) {
      return { success: true, data: data[0] };
    }

    // Fallback default value
    return {
      success: true,
      data: {
        symbol: symbol,
        funding_rate: 0.0001,
        mark_price: 0,
        index_price: 0,
        next_funding_time: new Date(
          Math.floor(Date.now() / 28800000 + 1) * 28800000
        ).toISOString(),
        created_at: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(
      `[getLatestFundingRate] Unexpected error for ${symbol}:`,
      error
    );
    return { success: false, error: String(error) };
  }
}

/**
 * Gets the next funding time for a specific symbol
 * Used to display countdown timers in the UI
 */
export async function getNextFundingTime(symbol: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("funding_rates")
      .select("next_funding_time")
      .eq("symbol", symbol)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      console.error(
        `[getNextFundingTime] Error or no data for ${symbol}:`,
        error || "No data"
      );

      // Calculate the next funding time (funding occurs every 8 hours: 00:00, 08:00, and 16:00 UTC)
      return calculateNextFundingTime();
    }

    // Check if the stored next_funding_time is in the past
    const storedTime = new Date(data[0].next_funding_time).getTime();
    const now = new Date().getTime();

    if (storedTime <= now) {
      // If it's in the past, calculate the next funding time
      return calculateNextFundingTime();
    }

    return {
      success: true,
      nextFundingTime: data[0].next_funding_time,
    };
  } catch (error) {
    console.error(
      `[getNextFundingTime] Unexpected error for ${symbol}:`,
      error
    );
    return calculateNextFundingTime();
  }
}

// Helper function to calculate the next funding time
function calculateNextFundingTime() {
  // Funding times are at 00:00, 08:00, and 16:00 UTC
  const now = new Date();
  const hours = now.getUTCHours();
  let nextFundingHour = 0;

  if (hours < 8) nextFundingHour = 8;
  else if (hours < 16) nextFundingHour = 16;
  else nextFundingHour = 24; // Next day 00:00

  const nextFunding = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (nextFundingHour === 24 ? 1 : 0),
      nextFundingHour % 24,
      0,
      0,
      0
    )
  );

  // Ensure the time is in the future (add 8 hours if it's not)
  if (nextFunding.getTime() <= now.getTime()) {
    nextFunding.setTime(nextFunding.getTime() + 8 * 60 * 60 * 1000);
  }

  return {
    success: true,
    nextFundingTime: nextFunding.toISOString(),
  };
}

/**
 * Applies funding fees to all open positions
 * This should be called at funding times (00:00, 08:00, 16:00 UTC)
 */
export async function applyFundingFees() {
  console.log("[applyFundingFees] Starting funding fee application");
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Step 1: Get all open positions
    const { data: positions, error: positionsError } = await supabase
      .from("trading_positions")
      .select("*")
      .is("closed_at", null);

    if (positionsError) {
      console.error(
        "[applyFundingFees] Error fetching positions:",
        positionsError
      );
      return { success: false, error: positionsError.message };
    }

    console.log(`[applyFundingFees] Found ${positions.length} open positions`);

    if (positions.length === 0) {
      return {
        success: true,
        message: "No open positions to apply funding to",
      };
    }

    // Step 2: Group positions by symbol for efficient processing
    const positionsBySymbol: Record<string, any[]> = {};
    positions.forEach((position) => {
      if (!positionsBySymbol[position.symbol]) {
        positionsBySymbol[position.symbol] = [];
      }
      positionsBySymbol[position.symbol].push(position);
    });

    // Step 3: Process each symbol
    const symbols = Object.keys(positionsBySymbol);
    const fundingPayments = [];
    let processedCount = 0;

    for (const symbol of symbols) {
      // Get the latest funding rate for this symbol
      const { data: fundingRateData, error: rateError } = await supabase
        .from("funding_rates")
        .select("*")
        .eq("symbol", symbol)
        .order("created_at", { ascending: false })
        .limit(1);

      if (rateError || !fundingRateData || fundingRateData.length === 0) {
        console.error(
          `[applyFundingFees] Error or no data for ${symbol}:`,
          rateError || "No data"
        );
        continue; // Skip this symbol but continue with others
      }

      const symbolPositions = positionsBySymbol[symbol];
      console.log(
        `[applyFundingFees] Processing ${symbolPositions.length} positions for ${symbol}`
      );

      // Process each position for this symbol
      for (const position of symbolPositions) {
        // Calculate funding fee: position_size * funding_rate
        // For longs: positive rate means pay, negative means receive
        // For shorts: positive rate means receive, negative means pay
        const isLong = position.direction.toLowerCase() === "long";
        const fundingRate = Number.parseFloat(fundingRateData[0].funding_rate);

        // Adjust sign based on position direction
        let adjustedRate = fundingRate;
        if (!isLong) {
          adjustedRate = -fundingRate; // Reverse for shorts
        }

        const fundingFee = position.position_size * adjustedRate;

        // Update position's cumulative funding fee
        const newCumulativeFee =
          (position.cumulative_funding_fee || 0) + fundingFee;

        // Update the position record using regular client
        // This works because we've updated the RLS policies to allow updating funding fields
        const { error: updateError } = await supabase
          .from("trading_positions")
          .update({
            cumulative_funding_fee: newCumulativeFee,
            last_funding_time: new Date().toISOString(),
          })
          .eq("id", position.id);

        if (updateError) {
          console.error(
            `[applyFundingFees] Error updating position ${position.id}:`,
            updateError
          );
          continue; // Skip this position but continue with others
        }

        // Update user's virtual currency balance
        // Negative fee means user receives, positive means user pays
        const balanceAdjustment = -fundingFee; // Negate because payment reduces balance

        // This would call your existing function to update user balance
        // For now, we'll just log it
        console.log(
          `[applyFundingFees] User ${position.user_id} balance adjustment: ${balanceAdjustment}`
        );

        // Record the funding payment
        fundingPayments.push({
          position_id: position.id,
          user_id: position.user_id,
          symbol: position.symbol,
          funding_rate: fundingRate,
          position_size: position.position_size,
          amount: fundingFee,
          position_direction: position.direction,
          created_at: new Date().toISOString(),
        });

        processedCount++;
      }
    }

    // Step 4: Insert all funding payments in a single batch
    if (fundingPayments.length > 0) {
      const { error: insertError } = await supabase
        .from("funding_payments")
        .insert(fundingPayments);

      if (insertError) {
        console.error(
          "[applyFundingFees] Error inserting funding payments:",
          insertError
        );
        return { success: false, error: insertError.message };
      }
    }

    const duration = Date.now() - startTime;
    console.log(
      `[applyFundingFees] Successfully processed ${processedCount} positions in ${duration}ms`
    );

    return {
      success: true,
      processedCount,
      paymentCount: fundingPayments.length,
    };
  } catch (error) {
    console.error("[applyFundingFees] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}
