import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase/client";
import type { Position, TradeHistory, RoomDetails } from "@/types";

interface RoomState {
  roomId: string | null;
  roomDetails: RoomDetails | null;
  positions: Position[];
  tradeHistory: TradeHistory[];
  virtualCurrency: number;
  currentPrice: number;
  selectedSymbol: string;
  isLoading: {
    room: boolean;
    positions: boolean;
    tradeHistory: boolean;
    virtualCurrency: boolean;
  };
  error: {
    room: string | null;
    positions: string | null;
    tradeHistory: string | null;
    virtualCurrency: string | null;
  };
  connectionStatus: "connected" | "connecting" | "disconnected";
  subscriptions: any[];

  // Actions
  setRoomId: (roomId: string) => void;
  resetRoomState: () => void;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  fetchPositions: (roomId: string) => Promise<void>;
  fetchTradeHistory: (roomId: string) => Promise<void>;
  fetchVirtualCurrency: (roomId: string) => Promise<void>;
  updateCurrentPrice: (price: number) => void;
  setSelectedSymbol: (symbol: string) => void;
  addPosition: (position: Position) => void;
  updatePosition: (positionId: string, updates: Partial<Position>) => void;
  removePosition: (positionId: string) => void;
  addTradeHistory: (trade: TradeHistory) => void;
  updateVirtualCurrency: (amount: number) => void;
  setConnectionStatus: (
    status: "connected" | "connecting" | "disconnected"
  ) => void;
  setupSubscriptions: (roomId: string) => () => void;
  cleanupSubscriptions: () => void;
  reconnect: () => Promise<boolean>;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      roomId: null,
      roomDetails: null,
      positions: [],
      tradeHistory: [],
      virtualCurrency: 0,
      currentPrice: 0,
      selectedSymbol: "",
      isLoading: {
        room: false,
        positions: false,
        tradeHistory: false,
        virtualCurrency: false,
      },
      error: {
        room: null,
        positions: null,
        tradeHistory: null,
        virtualCurrency: null,
      },
      connectionStatus: "disconnected",
      subscriptions: [],

      // Actions
      setRoomId: (roomId) => {
        set({ roomId });
      },

      resetRoomState: () => {
        const { cleanupSubscriptions } = get();
        cleanupSubscriptions();

        set({
          roomId: null,
          roomDetails: null,
          positions: [],
          tradeHistory: [],
          virtualCurrency: 0,
          currentPrice: 0,
          selectedSymbol: "",
          isLoading: {
            room: false,
            positions: false,
            tradeHistory: false,
            virtualCurrency: false,
          },
          error: {
            room: null,
            positions: null,
            tradeHistory: null,
            virtualCurrency: null,
          },
          connectionStatus: "disconnected",
          subscriptions: [],
        });
      },

      fetchRoomDetails: async (roomId) => {
        // Don't update state if roomId doesn't match current roomId
        if (get().roomId !== roomId) return;

        set((state) => ({
          isLoading: { ...state.isLoading, room: true },
          error: { ...state.error, room: null },
        }));

        try {
          const { data, error } = await supabase
            .from("trading_rooms")
            .select("*")
            .eq("id", roomId)
            .single();

          if (error) throw error;

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            roomDetails: data,
            isLoading: { ...state.isLoading, room: false },
          }));
        } catch (error: any) {
          console.error("Error fetching room details:", error);

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            error: { ...state.error, room: error.message },
            isLoading: { ...state.isLoading, room: false },
          }));
        }
      },

      fetchPositions: async (roomId) => {
        // Don't update state if roomId doesn't match current roomId
        if (get().roomId !== roomId) return;

        set((state) => ({
          isLoading: { ...state.isLoading, positions: true },
          error: { ...state.error, positions: null },
        }));

        try {
          const { data, error } = await supabase
            .from("trading_positions")
            .select("*")
            .eq("room_id", roomId)
            .eq("status", "open")
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            positions: data || [],
            isLoading: { ...state.isLoading, positions: false },
          }));
        } catch (error: any) {
          console.error("Error fetching positions:", error);

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            error: { ...state.error, positions: error.message },
            isLoading: { ...state.isLoading, positions: false },
          }));
        }
      },

      fetchTradeHistory: async (roomId) => {
        // Don't update state if roomId doesn't match current roomId
        if (get().roomId !== roomId) return;

        set((state) => ({
          isLoading: { ...state.isLoading, tradeHistory: true },
          error: { ...state.error, tradeHistory: null },
        }));

        try {
          const { data, error } = await supabase
            .from("trade_history")
            .select("*")
            .eq("room_id", roomId)
            .order("exit_time", { ascending: false });

          if (error) throw error;

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            tradeHistory: data || [],
            isLoading: { ...state.isLoading, tradeHistory: false },
          }));
        } catch (error: any) {
          console.error("Error fetching trade history:", error);

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            error: { ...state.error, tradeHistory: error.message },
            isLoading: { ...state.isLoading, tradeHistory: false },
          }));
        }
      },

      fetchVirtualCurrency: async (roomId) => {
        // Don't update state if roomId doesn't match current roomId
        if (get().roomId !== roomId) return;

        console.log("[fetchVirtualCurrency] Starting fetch for room:", roomId);

        set((state) => ({
          isLoading: { ...state.isLoading, virtualCurrency: true },
          error: { ...state.error, virtualCurrency: null },
        }));

        try {
          console.log(
            "[fetchVirtualCurrency] Querying Supabase for room:",
            roomId
          );

          const { data, error } = await supabase
            .from("trading_rooms")
            .select("virtual_currency")
            .eq("id", roomId)
            .single();

          console.log("[fetchVirtualCurrency] Response:", { data, error });

          if (error) throw error;

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          console.log(
            "[fetchVirtualCurrency] Setting virtual currency to:",
            data?.virtual_currency
          );

          set((state) => ({
            virtualCurrency: data?.virtual_currency || 0,
            isLoading: { ...state.isLoading, virtualCurrency: false },
          }));
        } catch (error: any) {
          console.error("[fetchVirtualCurrency] Error:", error);

          // Don't update state if roomId doesn't match current roomId
          if (get().roomId !== roomId) return;

          set((state) => ({
            error: { ...state.error, virtualCurrency: error.message },
            isLoading: { ...state.isLoading, virtualCurrency: false },
          }));
        }
      },

      updateCurrentPrice: (price) => {
        set({ currentPrice: price });
      },

      setSelectedSymbol: (symbol) => {
        set({ selectedSymbol: symbol });
      },

      addPosition: (position) => {
        set((state) => ({
          positions: [position, ...state.positions],
        }));
      },

      updatePosition: (positionId, updates) => {
        set((state) => ({
          positions: state.positions.map((pos) =>
            pos.id === positionId ? { ...pos, ...updates } : pos
          ),
        }));
      },

      removePosition: (positionId) => {
        set((state) => ({
          positions: state.positions.filter((pos) => pos.id !== positionId),
        }));
      },

      addTradeHistory: (trade) => {
        set((state) => ({
          tradeHistory: [trade, ...state.tradeHistory],
        }));
      },

      updateVirtualCurrency: (amount) => {
        set({ virtualCurrency: amount });
      },

      setConnectionStatus: (status) => {
        set({ connectionStatus: status });
      },

      setupSubscriptions: (roomId) => {
        const { cleanupSubscriptions } = get();
        cleanupSubscriptions();

        // Set up subscription for positions
        const positionsSubscription = supabase
          .channel(`trading_positions_${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "trading_positions",
              filter: `room_id=eq.${roomId}`,
            },
            (payload) => {
              console.log("Position change:", payload);
              const {
                fetchVirtualCurrency,
                addPosition,
                updatePosition,
                removePosition,
              } = get();

              if (
                payload.eventType === "INSERT" &&
                payload.new.status === "open"
              ) {
                addPosition(payload.new as Position);
              } else if (payload.eventType === "UPDATE") {
                if (payload.new.status === "open") {
                  updatePosition(
                    payload.new.id,
                    payload.new as Partial<Position>
                  );
                } else {
                  // Position closed or partially closed
                  removePosition(payload.old.id);

                  // Fetch updated virtual currency
                  fetchVirtualCurrency(roomId);
                }
              } else if (payload.eventType === "DELETE") {
                removePosition(payload.old.id);
              }
            }
          )
          .subscribe((status) => {
            console.log("Positions subscription status:", status);
            const { setConnectionStatus } = get();

            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            } else if (status === "TIMED_OUT" || status === "CHANNEL_ERROR") {
              setConnectionStatus("disconnected");
            }
          });

        // Set up subscription for trade history
        const tradeHistorySubscription = supabase
          .channel(`trade_history_${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "trade_history",
              filter: `room_id=eq.${roomId}`,
            },
            (payload) => {
              console.log("Trade history change:", payload);
              const { addTradeHistory } = get();
              addTradeHistory(payload.new as TradeHistory);
            }
          )
          .subscribe();

        // Set up subscription for virtual currency
        const virtualCurrencySubscription = supabase
          .channel(`trading_rooms_${roomId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "trading_rooms",
              filter: `id=eq.${roomId}`,
            },
            (payload) => {
              console.log("Virtual currency change:", payload);
              const { updateVirtualCurrency } = get();

              if (payload.new.virtual_currency !== undefined) {
                updateVirtualCurrency(payload.new.virtual_currency);
              }
            }
          )
          .subscribe();

        // Store subscriptions for cleanup
        set({
          subscriptions: [
            positionsSubscription,
            tradeHistorySubscription,
            virtualCurrencySubscription,
          ],
        });

        // Return cleanup function
        return () => {
          cleanupSubscriptions();
        };
      },

      cleanupSubscriptions: () => {
        const { subscriptions } = get();
        subscriptions.forEach((subscription) => {
          if (subscription) {
            supabase.removeChannel(subscription);
          }
        });
        set({ subscriptions: [] });
      },

      reconnect: async () => {
        const {
          roomId,
          setConnectionStatus,
          cleanupSubscriptions,
          fetchRoomDetails,
          fetchPositions,
          fetchTradeHistory,
          fetchVirtualCurrency,
          setupSubscriptions,
        } = get();

        setConnectionStatus("connecting");

        try {
          // Remove all existing channels
          cleanupSubscriptions();

          // Try to refresh the session
          const { error } = await supabase.auth.refreshSession();
          if (error) {
            console.error("Error refreshing session:", error);
            setConnectionStatus("disconnected");
            return false;
          }

          // Re-fetch all data
          if (roomId) {
            await Promise.all([
              fetchRoomDetails(roomId),
              fetchPositions(roomId),
              fetchTradeHistory(roomId),
              fetchVirtualCurrency(roomId),
            ]);

            // Set up subscriptions again
            setupSubscriptions(roomId);
          }

          setConnectionStatus("connected");
          return true;
        } catch (error) {
          console.error("Error reconnecting:", error);
          setConnectionStatus("disconnected");
          return false;
        }
      },
    }),
    {
      name: "room-storage",
      partialize: (state) => ({
        roomId: state.roomId,
        roomDetails: state.roomDetails,
        positions: state.positions,
        tradeHistory: state.tradeHistory.slice(0, 20), // Only persist the 20 most recent trades
        virtualCurrency: state.virtualCurrency,
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
);

// Create stable selectors to avoid infinite loops
export const useRoomId = () => useRoomStore((state) => state.roomId);
export const useRoomDetails = () => useRoomStore((state) => state.roomDetails);
export const usePositionsData = () => useRoomStore((state) => state.positions);
export const useTradeHistoryData = () =>
  useRoomStore((state) => state.tradeHistory);
export const useVirtualCurrencyValue = () =>
  useRoomStore((state) => state.virtualCurrency);
export const useVirtualCurrencyLoading = () =>
  useRoomStore((state) => state.isLoading.virtualCurrency);
export const useVirtualCurrencyError = () =>
  useRoomStore((state) => state.error.virtualCurrency);
export const usePositionsLoading = () =>
  useRoomStore((state) => state.isLoading.positions);
export const usePositionsError = () =>
  useRoomStore((state) => state.error.positions);
export const useConnectionStatusValue = () =>
  useRoomStore((state) => state.connectionStatus);
