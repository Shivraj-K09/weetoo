"use server";

import { createClient } from "@/lib/supabase/server";

// Simple in-memory cache for position price updates
const positionPriceCache = new Map<
  string,
  {
    price: number;
    timestamp: number;
    pnl: number;
    pnlPercentage: number;
  }
>();

// Cache TTL in milliseconds (5 seconds)
const CACHE_TTL = 5000;

// Helper function to extract UUID from a string
function extractUUID(str: string): string | null {
  if (!str) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidRegex =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;
  const match = str.match(uuidRegex);
  return match ? match[1] : null;
}

// Types for trade execution
type TradeDirection = "buy" | "sell";
type TradeStatus = "open" | "closed" | "partially_closed";
type OrderType = "market" | "limit";

interface ExecuteTradeParams {
  roomId: string;
  symbol: string;
  direction: TradeDirection;
  entryAmount: number;
  leverage: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  orderType?: OrderType; // Added orderType parameter
}

interface ClosePositionParams {
  positionId: string;
  exitPrice?: number; // Optional - if not provided, use current market price
}

// Update the PartialClosePositionParams interface to include exitPrice
interface PartialClosePositionParams {
  positionId: string;
  percentage: number;
  exitPrice?: number; // Add this parameter
}

// Execute a new trade
export async function executeTrade({
  roomId,
  symbol,
  direction,
  entryAmount,
  leverage,
  entryPrice,
  stopLoss,
  takeProfit,
  orderType = "market", // Default to market order
}: ExecuteTradeParams) {
  try {
    console.log("[AMOUNT_DEBUG] executeTrade Starting with params:", {
      roomId,
      symbol,
      direction,
      entryAmount,
      leverage,
      entryPrice,
      stopLoss,
      takeProfit,
      orderType, // Log the order type
    });

    // Extract the UUID part from the roomId if needed
    const extractedUUID = extractUUID(roomId) || roomId;
    console.log(
      "[executeTrade] Original roomId:",
      roomId,
      "Extracted UUID:",
      extractedUUID
    );

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("[executeTrade] Not authenticated");
      return { success: false, message: "Not authenticated" };
    }

    const userId = session.user.id;
    console.log("[executeTrade] User ID:", userId);

    // Get room details to check if user is the host
    console.log(
      "[executeTrade] Querying trading_rooms table with id:",
      extractedUUID
    );
    const { data: room, error: roomError } = await supabase
      .from("trading_rooms")
      .select("owner_id, virtual_currency") // Fixed: using owner_id instead of created_by
      .eq("id", extractedUUID)
      .single();

    if (roomError) {
      console.error("[executeTrade] Error getting room:", roomError);
      console.log("[executeTrade] Error details:", JSON.stringify(roomError));
      return {
        success: false,
        message: "Room not found: " + roomError.message,
      };
    }

    if (!room) {
      console.log("[executeTrade] Room not found");
      return { success: false, message: "Room not found" };
    }

    console.log("[executeTrade] Room found:", room);

    // Calculate position size - CRITICAL FIX: Use the exact entry amount provided by the user
    const positionSize = entryAmount * leverage;
    console.log(
      "[AMOUNT_DEBUG] Position size calculation: entryAmount:",
      entryAmount,
      "* leverage:",
      leverage,
      "=",
      positionSize
    );

    // Check if there's enough virtual currency
    if (entryAmount > (room.virtual_currency || 0)) {
      console.log(
        "[executeTrade] Insufficient virtual currency. Required:",
        entryAmount,
        "Available:",
        room.virtual_currency
      );
      return { success: false, message: "Insufficient virtual currency" };
    }

    // Ensure direction is correctly passed as "buy" or "sell"
    const tradeDirection = direction === "buy" ? "buy" : "sell";
    console.log(
      "[executeTrade] Final direction being sent to database:",
      tradeDirection
    );

    // Start a transaction
    console.log(
      "[AMOUNT_DEBUG] Calling execute_trade RPC function with position size:",
      positionSize
    );
    const { data, error } = await supabase.rpc("execute_trade", {
      p_room_id: extractedUUID,
      p_user_id: userId,
      p_symbol: symbol,
      p_direction: tradeDirection, // Make sure we're passing the correct direction
      p_entry_price: entryPrice,
      p_entry_amount: entryAmount, // CRITICAL: Use the exact amount entered by the user
      p_leverage: Number(leverage),
      p_position_size: positionSize, // CRITICAL: Use the calculated position size
      p_stop_loss: stopLoss || null,
      p_take_profit: takeProfit || null,
      p_order_type: orderType, // Pass the order type to the function
    });

    if (error) {
      console.error("[executeTrade] Error executing trade:", error);
      console.log("[executeTrade] Error details:", JSON.stringify(error));
      return { success: false, message: error.message };
    }

    console.log(
      "[executeTrade] Trade executed successfully. Position ID:",
      data
    );

    // Dispatch a custom event to notify components about the new position
    if (typeof window !== "undefined") {
      const event = new CustomEvent("new-position-created", {
        detail: { roomId: extractedUUID, positionId: data },
      });
      window.dispatchEvent(event);
    }

    return {
      success: true,
      message: "Trade executed successfully",
      positionId: data,
    };
  } catch (error) {
    console.error("[executeTrade] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Update the closePosition function to correctly calculate PnL and update balance
export async function closePosition({
  positionId,
  exitPrice,
}: ClosePositionParams) {
  try {
    console.log("[closePosition] Starting with params:", {
      positionId,
      exitPrice,
    });

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    const userId = session.user.id;

    // Get position details
    const { data: position, error: positionError } = await supabase
      .from("trading_positions")
      .select("*, trading_rooms!inner(owner_id, id)") // Include room_id for revalidation
      .eq("id", positionId)
      .single();

    if (positionError || !position) {
      return { success: false, message: "Position not found" };
    }

    // If exitPrice is not provided, use current market price from position
    const finalExitPrice =
      exitPrice || position.current_price || position.entry_price;

    // CRITICAL FIX: Ensure we're using the actual provided exit price
    // Remove the adjustment code that was causing issues
    // The following code should be removed:
    /*
    let adjustedExitPrice = finalExitPrice;
    if (Math.abs(adjustedExitPrice - position.entry_price) / position.entry_price < 0.0001) {
      // If the difference is less than 0.01%, add a small adjustment
      if (position.direction === "buy") {
        // For long positions, make exit price slightly higher for profit
        adjustedExitPrice = position.entry_price * 1.0005; // 0.05% higher
      } else {
        // For short positions, make exit price slightly lower for profit
        adjustedExitPrice = position.entry_price * 0.9995; // 0.05% lower
      }
      console.log("[closePosition] Adjusted exit price from", finalExitPrice, "to", adjustedExitPrice);
    }
    */

    // Use the exact exit price provided without adjustments
    const adjustedExitPrice = finalExitPrice;

    // Calculate P&L
    let pnl = 0;
    let pnlPercentage = 0;

    if (position.direction === "buy") {
      // For long positions: (exit_price - entry_price) / entry_price * position_size
      pnl =
        ((adjustedExitPrice - position.entry_price) / position.entry_price) *
        position.position_size;
    } else {
      // For short positions: (entry_price - exit_price) / entry_price * position.position_size
      pnl =
        ((position.entry_price - adjustedExitPrice) / position.entry_price) *
        position.position_size;
    }

    pnlPercentage = (pnl / position.entry_amount) * 100;

    console.log(
      "[closePosition] Calculated PnL:",
      pnl,
      "PnL Percentage:",
      pnlPercentage
    );
    console.log(
      "[closePosition] Entry price:",
      position.entry_price,
      "Exit price:",
      adjustedExitPrice
    );

    // Calculate trade volume (entry + exit)
    const tradeVolume = position.position_size * 2; // Both entry and exit

    // Start a database transaction
    const { data: closeResult, error: closeError } = await supabase.rpc(
      "close_position",
      {
        p_position_id: positionId,
        p_exit_price: adjustedExitPrice,
        p_pnl: pnl,
        p_pnl_percentage: pnlPercentage,
        p_trade_volume: tradeVolume,
      }
    );

    if (closeError) {
      console.error("[closePosition] Error closing position:", closeError);
      return { success: false, message: closeError.message };
    }

    console.log(
      "[closePosition] Position closed successfully with result:",
      closeResult
    );

    // Get the room ID for revalidation
    const roomId = position.trading_rooms?.id || position.room_id;

    // Get the newly created trade history entry
    const { data: tradeHistory, error: tradeHistoryError } = await supabase
      .from("trade_history")
      .select("*")
      .eq("position_id", positionId)
      .single();

    if (tradeHistoryError) {
      console.error(
        "[closePosition] Error getting trade history:",
        tradeHistoryError
      );
    }

    // Dispatch a custom event to notify components about the closed position
    if (typeof window !== "undefined") {
      const event = new CustomEvent("position-closed", {
        detail: {
          roomId,
          positionId,
          tradeHistory: tradeHistory || null,
        },
      });
      window.dispatchEvent(event);

      // Also trigger a virtual currency update
      const currencyEvent = new CustomEvent("virtual-currency-update", {
        detail: { roomId },
      });
      window.dispatchEvent(currencyEvent);
    }

    return {
      success: true,
      message: "Position closed successfully",
      pnl,
      pnlPercentage,
      tradeHistory: tradeHistory || null,
    };
  } catch (error) {
    console.error("[closePosition] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Get open positions for a room
export async function getRoomPositions(roomId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, positions: [], message: "Not authenticated" };
    }

    // Get all open positions for the room with only necessary fields
    const { data: positions, error } = await supabase
      .from("trading_positions")
      .select(
        `
        id,
        room_id,
        user_id,
        symbol,
        direction,
        entry_price,
        entry_amount,
        leverage,
        position_size,
        current_price,
        current_pnl,
        pnl_percentage,
        stop_loss,
        take_profit,
        status,
        created_at,
        updated_at
      `
      )
      .eq("room_id", roomId)
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting room positions:", error);
      return { success: false, positions: [], message: error.message };
    }

    return { success: true, positions: positions || [] };
  } catch (error) {
    console.error("Unexpected error in getRoomPositions:", error);
    return {
      success: false,
      positions: [],
      message: "An unexpected error occurred",
    };
  }
}

// Get trade history for a room
export async function getRoomTradeHistory(roomId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, trades: [], message: "Not authenticated" };
    }

    // Get all trade history for the room
    const { data: trades, error } = await supabase
      .from("trade_history")
      .select("*")
      .eq("room_id", roomId)
      .order("exit_time", { ascending: false });

    if (error) {
      console.error("Error getting room trade history:", error);
      return { success: false, trades: [], message: error.message };
    }

    // Log the first trade to check entry and exit prices
    if (trades && trades.length > 0) {
      console.log("[getRoomTradeHistory] First trade:", {
        entry: trades[0].entry_price,
        exit: trades[0].exit_price,
        pnl: trades[0].pnl,
        pnl_percentage: trades[0].pnl_percentage,
      });
    }

    return { success: true, trades: trades || [] };
  } catch (error) {
    console.error("Unexpected error in getRoomTradeHistory:", error);
    return {
      success: false,
      trades: [],
      message: "An unexpected error occurred",
    };
  }
}

// Update position price and P&L with caching
export async function updatePositionPrice(
  positionId: string,
  currentPrice: number
) {
  try {
    // Check cache first
    const now = Date.now();
    const cachedData = positionPriceCache.get(positionId);

    // If we have recent cached data and price hasn't changed significantly (0.1%), use cache
    if (
      cachedData &&
      now - cachedData.timestamp < CACHE_TTL &&
      Math.abs(cachedData.price - currentPrice) / cachedData.price < 0.001
    ) {
      return {
        success: true,
        message: "Position price from cache",
        currentPnl: cachedData.pnl,
        pnlPercentage: cachedData.pnlPercentage,
        fromCache: true,
      };
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    // Get position details
    const { data: position, error: positionError } = await supabase
      .from("trading_positions")
      .select("*")
      .eq("id", positionId)
      .single();

    if (positionError || !position) {
      return { success: false, message: "Position not found" };
    }

    // Calculate current P&L
    let currentPnl = 0;
    let pnlPercentage = 0;

    if (position.direction === "buy") {
      // For long positions: (current_price - entry_price) / entry_price * position_size
      currentPnl =
        ((currentPrice - position.entry_price) / position.entry_price) *
        position.position_size;
    } else {
      // For short positions: (entry_price - current_price) / entry_price * position_size
      currentPnl =
        ((position.entry_price - currentPrice) / position.entry_price) *
        position.position_size;
    }

    pnlPercentage = (currentPnl / position.entry_amount) * 100;

    // Update cache
    positionPriceCache.set(positionId, {
      price: currentPrice,
      timestamp: now,
      pnl: currentPnl,
      pnlPercentage: pnlPercentage,
    });

    // Check if stop loss or take profit conditions are met
    let shouldClosePosition = false;
    let closeReason = "";

    // Check stop loss condition
    if (position.stop_loss && position.stop_loss > 0) {
      if (
        (position.direction === "buy" && currentPrice <= position.stop_loss) ||
        (position.direction === "sell" && currentPrice >= position.stop_loss)
      ) {
        shouldClosePosition = true;
        closeReason = "Stop loss triggered";
      }
    }

    // Check take profit condition
    if (position.take_profit && position.take_profit > 0) {
      if (
        (position.direction === "buy" &&
          currentPrice >= position.take_profit) ||
        (position.direction === "sell" && currentPrice <= position.take_profit)
      ) {
        shouldClosePosition = true;
        closeReason = "Take profit triggered";
      }
    }

    // If stop loss or take profit triggered, close the position
    if (shouldClosePosition) {
      console.log(
        `[updatePositionPrice] ${closeReason} for position ${positionId}`
      );

      // Close the position at current price
      const closeResult = await closePosition({
        positionId: position.id,
        exitPrice: currentPrice,
      });

      if (closeResult.success) {
        // Remove from cache on close
        positionPriceCache.delete(positionId);

        return {
          success: true,
          message: `Position closed automatically: ${closeReason}`,
          currentPnl,
          pnlPercentage,
        };
      } else {
        console.error(
          `[updatePositionPrice] Failed to close position: ${closeResult.message}`
        );
      }
    }

    // Update the position in database only if significant change (0.5%)
    // or if it's been more than 10 seconds since last update
    const significantChange =
      !position.current_price ||
      Math.abs(currentPrice - position.current_price) / position.current_price >
        0.005;
    const lastUpdateTime = new Date(position.updated_at).getTime();
    const timeThreshold = now - lastUpdateTime > 10000;

    if (significantChange || timeThreshold) {
      const { error: updateError } = await supabase
        .from("trading_positions")
        .update({
          current_price: currentPrice,
          current_pnl: currentPnl,
          pnl_percentage: pnlPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", positionId);

      if (updateError) {
        console.error("Error updating position price:", updateError);
        return { success: false, message: updateError.message };
      }

      console.log(
        `[updatePositionPrice] Updated position ${positionId} in database`
      );
    } else {
      console.log(
        `[updatePositionPrice] Skipped database update for position ${positionId} (no significant change)`
      );
    }

    return {
      success: true,
      message: "Position price updated successfully",
      currentPnl,
      pnlPercentage,
    };
  } catch (error) {
    console.error("Unexpected error in updatePositionPrice:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Partial close position
export async function partialClosePosition({
  positionId,
  percentage,
  exitPrice,
}: PartialClosePositionParams) {
  try {
    console.log("[partialClosePosition] Starting with params:", {
      positionId,
      percentage,
    });

    if (percentage <= 0 || percentage >= 100) {
      return {
        success: false,
        message: "Percentage must be between 0 and 100",
      };
    }

    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { success: false, message: "Not authenticated" };
    }

    // Get position details
    const { data: position, error: positionError } = await supabase
      .from("trading_positions")
      .select("*, trading_rooms!inner(owner_id, id)")
      .eq("id", positionId)
      .single();

    if (positionError || !position) {
      return { success: false, message: "Position not found" };
    }

    // Use provided exit price if available, otherwise use current price or entry price
    const currentPrice =
      exitPrice || position.current_price || position.entry_price;

    // Calculate the amount to close based on percentage
    const closePercentage = percentage / 100;
    const closeAmount = position.position_size * closePercentage;
    const closeEntryAmount = position.entry_amount * closePercentage;

    // Calculate P&L for the closed portion
    let pnl = 0;
    let pnlPercentage = 0;

    if (position.direction === "buy") {
      // For long positions: (current_price - entry_price) / entry_price * close_amount
      pnl =
        ((currentPrice - position.entry_price) / position.entry_price) *
        closeAmount;
    } else {
      // For short positions: (entry_price - current_price) / entry_price * closeAmount
      pnl =
        ((position.entry_price - currentPrice) / position.entry_price) *
        closeAmount;
    }

    pnlPercentage = (pnl / closeEntryAmount) * 100;

    // Calculate trade volume for the closed portion (entry + exit)
    const tradeVolume = closeAmount * 2; // Both entry and exit

    // Call the partial_close_position RPC function
    const { data: closeResult, error: closeError } = await supabase.rpc(
      "partial_close_position",
      {
        p_position_id: positionId,
        p_exit_price: currentPrice,
        p_close_percentage: closePercentage,
        p_pnl: pnl,
        p_pnl_percentage: pnlPercentage,
        p_trade_volume: tradeVolume,
      }
    );

    if (closeError) {
      console.error(
        "[partialClosePosition] Error partially closing position:",
        closeError
      );
      return { success: false, message: closeError.message };
    }

    console.log(
      "[partialClosePosition] Position partially closed successfully with result:",
      closeResult
    );

    // Get the room ID for revalidation
    const roomId = position.trading_rooms?.id || position.room_id;

    // Get the newly created trade history entry for the partial close
    const { data: tradeHistory, error: tradeHistoryError } = await supabase
      .from("trade_history")
      .select("*")
      .eq("position_id", positionId)
      .order("exit_time", { ascending: false })
      .limit(1)
      .single();

    if (tradeHistoryError) {
      console.error(
        "[partialClosePosition] Error getting trade history:",
        tradeHistoryError
      );
    }

    // Dispatch custom events to notify components
    if (typeof window !== "undefined") {
      // Notify about position partial close
      const closeEvent = new CustomEvent("position-closed", {
        detail: {
          roomId,
          positionId,
          partial: true,
          percentage,
          tradeHistory: tradeHistory || null,
        },
      });
      window.dispatchEvent(closeEvent);

      // Trigger virtual currency update
      const currencyEvent = new CustomEvent("virtual-currency-update", {
        detail: { roomId },
      });
      window.dispatchEvent(currencyEvent);
    }

    return {
      success: true,
      message: `${percentage}% of position closed successfully`,
      pnl,
      pnlPercentage,
      tradeHistory: tradeHistory || null,
    };
  } catch (error) {
    console.error("[partialClosePosition] Unexpected error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}

// Get room balance details including locked margin and available balance
export async function getRoomBalanceDetails(roomId: string) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        message: "Not authenticated",
        balance: null,
      };
    }

    // Get room balance details from the view
    const { data: balanceData, error: balanceError } = await supabase
      .from("room_balance_view")
      .select("*")
      .eq("id", roomId)
      .single();

    if (balanceError) {
      console.error(
        "[getRoomBalanceDetails] Error getting room balance:",
        balanceError
      );
      return {
        success: false,
        message: balanceError.message,
        balance: null,
      };
    }

    // Calculate unrealized PnL from open positions
    const { data: positions, error: positionsError } = await supabase
      .from("trading_positions")
      .select("current_pnl")
      .eq("room_id", roomId)
      .eq("status", "open");

    if (positionsError) {
      console.error(
        "[getRoomBalanceDetails] Error getting positions:",
        positionsError
      );
    }

    // Sum up unrealized PnL
    const unrealizedPnl =
      positions?.reduce(
        (sum, position) => sum + (position.current_pnl || 0),
        0
      ) || 0;

    // Return the balance details
    return {
      success: true,
      message: "Room balance details retrieved successfully",
      balance: {
        holdings: balanceData.virtual_currency,
        lockedMargin: balanceData.locked_margin || 0,
        available: balanceData.available_balance || 0,
        unrealizedPnl: unrealizedPnl,
        valuation: (balanceData.virtual_currency || 0) + unrealizedPnl,
      },
    };
  } catch (error) {
    console.error("[getRoomBalanceDetails] Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
      balance: null,
    };
  }
}
