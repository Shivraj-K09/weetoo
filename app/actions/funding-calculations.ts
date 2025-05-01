"use server";

import { createClient } from "@/lib/supabase/server";
import { updateVirtualCurrency } from "@/utils/update-virtual-currency";

// Define proper types to avoid 'any' type errors
interface Position {
  id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: string;
  position_size: number;
  cumulative_funding_fee: number | null;
  last_funding_time: string | null;
}

interface PositionsBySymbol {
  [symbol: string]: Position[];
}

interface RoomAdjustment {
  userId: string;
  amount: number;
}

interface PositionsByRoom {
  [roomId: string]: {
    roomId: string;
    adjustments: RoomAdjustment[];
  };
}

interface FundingPayment {
  position_id: string;
  user_id: string;
  room_id: string;
  symbol: string;
  funding_rate: number;
  position_size: number;
  amount: number;
  position_direction: string;
  created_at: string;
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
    const { data: positionsData, error: positionsError } = await supabase
      .from("trading_positions")
      .select(
        `
        id, 
        room_id, 
        user_id, 
        symbol, 
        direction, 
        position_size, 
        cumulative_funding_fee,
        last_funding_time
      `
      )
      .is("status", "open");

    if (positionsError) {
      console.error(
        "[applyFundingFees] Error fetching positions:",
        positionsError
      );
      return { success: false, error: positionsError.message };
    }

    // Type assertion to ensure positions have the correct type
    const positions = positionsData as Position[];
    console.log(`[applyFundingFees] Found ${positions.length} open positions`);

    if (positions.length === 0) {
      return {
        success: true,
        message: "No open positions to apply funding to",
      };
    }

    // Step 2: Group positions by symbol for efficient processing
    const positionsBySymbol: PositionsBySymbol = {};
    positions.forEach((position) => {
      if (!positionsBySymbol[position.symbol]) {
        positionsBySymbol[position.symbol] = [];
      }
      positionsBySymbol[position.symbol].push(position);
    });

    // Step 3: Process each symbol
    const symbols = Object.keys(positionsBySymbol);
    const fundingPayments: FundingPayment[] = [];
    let processedCount = 0;
    let totalFundingAmount = 0;

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

      const fundingRate = Number(fundingRateData[0].funding_rate);
      const symbolPositions = positionsBySymbol[symbol];

      console.log(
        `[applyFundingFees] Processing ${symbolPositions.length} positions for ${symbol} with rate ${fundingRate}`
      );

      // Group positions by room for efficient balance updates
      const positionsByRoom: PositionsByRoom = {};

      // Process each position for this symbol
      for (const position of symbolPositions) {
        // Calculate funding fee: position_size * funding_rate
        // For longs: positive rate means pay, negative means receive
        // For shorts: positive rate means receive, negative means pay
        const isLong = position.direction.toLowerCase() === "long";

        // Adjust sign based on position direction
        let adjustedRate = fundingRate;
        if (!isLong) {
          adjustedRate = -fundingRate; // Reverse for shorts
        }

        const fundingFee = position.position_size * adjustedRate;
        totalFundingAmount += Math.abs(fundingFee);

        // Update position's cumulative funding fee
        const newCumulativeFee =
          (position.cumulative_funding_fee || 0) + fundingFee;

        // Update the position record
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

        // Group by room for balance updates
        if (!positionsByRoom[position.room_id]) {
          positionsByRoom[position.room_id] = {
            roomId: position.room_id,
            adjustments: [],
          };
        }

        // Add to room adjustments
        positionsByRoom[position.room_id].adjustments.push({
          userId: position.user_id,
          amount: -fundingFee, // Negative fee means user receives, positive means user pays
        });

        // Record the funding payment
        fundingPayments.push({
          position_id: position.id,
          user_id: position.user_id,
          room_id: position.room_id,
          symbol: position.symbol,
          funding_rate: fundingRate,
          position_size: position.position_size,
          amount: fundingFee,
          position_direction: position.direction,
          created_at: new Date().toISOString(),
        });

        processedCount++;
      }

      // Update virtual currency balances for each room
      for (const roomId in positionsByRoom) {
        const roomData = positionsByRoom[roomId];

        // Update each user's balance in this room
        for (const adjustment of roomData.adjustments) {
          try {
            // Use existing utility to update virtual currency
            await updateVirtualCurrency(
              roomData.roomId,
              adjustment.userId,
              adjustment.amount,
              `Funding fee: ${adjustment.amount > 0 ? "Received" : "Paid"} ${Math.abs(adjustment.amount).toFixed(2)} USDT`
            );
          } catch (error) {
            console.error(
              `[applyFundingFees] Error updating balance for user ${adjustment.userId}:`,
              error
            );
          }
        }
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
      `[applyFundingFees] Successfully processed ${processedCount} positions with ${totalFundingAmount.toFixed(2)} USDT in fees in ${duration}ms`
    );

    return {
      success: true,
      processedCount,
      paymentCount: fundingPayments.length,
      totalFundingAmount: totalFundingAmount,
    };
  } catch (error) {
    console.error("[applyFundingFees] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Gets funding payment history for a user in a specific room
 */
export async function getFundingPaymentHistory(roomId: string, userId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("funding_payments")
      .select("*")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("[getFundingPaymentHistory] Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("[getFundingPaymentHistory] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Gets total funding fees paid/received for a position
 */
export async function getPositionFundingFees(positionId: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("trading_positions")
      .select("cumulative_funding_fee")
      .eq("id", positionId)
      .single();

    if (error) {
      console.error("[getPositionFundingFees] Error:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      cumulativeFee: data.cumulative_funding_fee || 0,
    };
  } catch (error) {
    console.error("[getPositionFundingFees] Unexpected error:", error);
    return { success: false, error: String(error) };
  }
}
