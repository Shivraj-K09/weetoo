"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define privacy type as a union type for better type safety
type Privacy = "private" | "public";
type RoomCategory = "regular" | "voice";

// Define the room details type
interface RoomData {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  max_participants: number;
  owner_id: string;
  participants: string[];
  created_at: string;
  room_category?: RoomCategory;
  initial_balance?: number;
  final_balance?: number;
  room_profit_rate?: number;
  is_included_in_user_rate?: boolean;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export function useRoomDetails(roomData: RoomData | null, roomId: string) {
  const router = useRouter();
  const [roomDetails, setRoomDetails] = useState<RoomData | null>(
    roomData || null
  );
  const [isLoading, setIsLoading] = useState(!roomData);
  const [participants, setParticipants] = useState<User[]>([]);
  const [ownerName, setOwnerName] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [lastParticipantsFetch, setLastParticipantsFetch] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const authCheckedRef = useRef(false);
  const fetchAttemptsRef = useRef(0);
  const maxFetchAttempts = 5; // Increased from 3 to 5
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptRef = useRef(0);

  // Check current user ID with improved error handling
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        console.log("[ROOM DETAILS] Checking current user session");

        // Get the current session without refreshing first
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[ROOM DETAILS] Error getting session:", error);

          // If we've tried too many times, give up
          if (connectionAttemptRef.current >= 3) {
            console.error(
              "[ROOM DETAILS] Failed to get session after multiple attempts"
            );
            return;
          }

          // Otherwise, try again after a delay
          connectionAttemptRef.current++;
          setTimeout(checkCurrentUser, 2000);
          return;
        }

        if (data.session) {
          console.log(
            "[ROOM DETAILS] Session found, user ID:",
            data.session.user.id
          );
          setCurrentUserId(data.session.user.id);
          connectionAttemptRef.current = 0; // Reset counter on success
        } else {
          console.log("[ROOM DETAILS] No session found");

          // If we've tried too many times, give up
          if (connectionAttemptRef.current >= 3) {
            console.error(
              "[ROOM DETAILS] No session found after multiple attempts"
            );
            return;
          }

          // Otherwise, try again after a delay
          connectionAttemptRef.current++;
          setTimeout(checkCurrentUser, 2000);
        }
      } catch (error) {
        console.error("[ROOM DETAILS] Error checking current user:", error);

        // If we've tried too many times, give up
        if (connectionAttemptRef.current >= 3) {
          console.error(
            "[ROOM DETAILS] Failed to check current user after multiple attempts"
          );
          return;
        }

        // Otherwise, try again after a delay
        connectionAttemptRef.current++;
        setTimeout(checkCurrentUser, 2000);
      }
    };

    checkCurrentUser();
  }, []);

  // Create a memoized function to fetch participants
  const fetchParticipants = useCallback(
    async (participantIds?: string[]) => {
      try {
        const idsToFetch = participantIds || roomDetails?.participants || [];

        if (!idsToFetch || idsToFetch.length === 0) {
          console.log("[ROOM DETAILS] No participants to fetch");
          setParticipants([]);
          return;
        }

        console.log("[ROOM DETAILS] Fetching participants:", idsToFetch);

        const { data: participantsData, error: participantsError } =
          await supabase
            .from("users")
            .select("id, first_name, last_name, email, avatar_url")
            .in("id", idsToFetch);

        if (participantsError) {
          console.error(
            "[ROOM DETAILS] Error fetching participants:",
            participantsError
          );
          setParticipants([]);
        } else {
          console.log(
            "[ROOM DETAILS] Participants fetched:",
            participantsData?.length || 0
          );
          setParticipants(participantsData || []);
          setLastParticipantsFetch(Date.now());
        }
      } catch (error) {
        console.error("[ROOM DETAILS] Failed to fetch participants:", error);
        setParticipants([]);
      }
    },
    [roomDetails]
  );

  // Ensure owner is in participants list
  const ensureOwnerInParticipants = useCallback(
    async (roomId: string, participants: string[], ownerId: string) => {
      if (!participants.includes(ownerId)) {
        console.log(
          "[ROOM DETAILS] Owner not in participants list, adding them"
        );
        try {
          const updatedParticipants = [...participants, ownerId];
          await supabase
            .from("trading_rooms")
            .update({ participants: updatedParticipants })
            .eq("id", roomId);
        } catch (error) {
          console.error(
            "[ROOM DETAILS] Error adding owner to participants:",
            error
          );
        }
      }
    },
    []
  );

  // Fetch room details if not provided with improved error handling
  useEffect(() => {
    // Clear any existing timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    // Set a new timeout with progressive feedback
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.log(
          "[ROOM DETAILS] Initial loading period elapsed, continuing to wait..."
        );
        // Show a toast but keep trying
        toast.loading("Still loading room data...", {
          id: "room-loading",
          duration: 10000,
        });

        // Set a second more extended timeout
        const extendedTimeoutId = setTimeout(() => {
          if (isLoading) {
            console.error("[ROOM DETAILS] Extended loading timeout reached");
            setIsLoading(false);
            toast.error("Room loading timeout. Please try again.", {
              id: "room-loading",
            });
          }
        }, 20000); // Additional 20 seconds (35 total)

        // Store the extended timeout ID for cleanup
        loadingTimeoutRef.current = extendedTimeoutId;
      }
    }, 15000); // Initial 15 seconds timeout

    // If room data is provided directly, use it
    if (roomData) {
      console.log("[ROOM DETAILS] Using provided room data:", roomData.id);
      setRoomDetails(roomData);
      setIsLoading(false);

      // Set the selected symbol
      if (roomData.trading_pairs && roomData.trading_pairs.length > 0) {
        setSelectedSymbol(roomData.trading_pairs[0]);
      }

      // Fetch owner name
      const fetchOwner = async () => {
        try {
          if (!roomData.owner_id) {
            console.log("[ROOM DETAILS] No owner ID available");
            setOwnerName("Unknown");
            return;
          }

          const { data: ownerData, error: ownerError } = await supabase
            .from("users")
            .select("first_name, last_name")
            .eq("id", roomData.owner_id)
            .single();

          if (ownerError) {
            console.error(
              "[ROOM DETAILS] Error fetching owner data:",
              ownerError
            );
            setOwnerName("Unknown");
          } else if (ownerData) {
            setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("[ROOM DETAILS] Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }
      };

      fetchOwner();
      fetchParticipants(roomData.participants || []);

      // If current user is the owner, ensure they're in the participants list
      if (currentUserId && currentUserId === roomData.owner_id) {
        ensureOwnerInParticipants(
          roomData.id,
          roomData.participants || [],
          currentUserId
        );
      }

      // Clear the timeout since we're done loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      return;
    }

    // If no room data provided, fetch it
    const fetchRoomDetails = async () => {
      // Track if this fetch attempt has been aborted
      const abortController = new AbortController();
      const isAborted = { current: false };

      try {
        setIsLoading(true);
        fetchAttemptsRef.current += 1;

        if (!roomId) {
          console.error("[ROOM DETAILS] No room ID available");
          router.push("/");
          return;
        }

        console.log(
          `[ROOM DETAILS] Fetching room details for ID: ${roomId} (Attempt ${fetchAttemptsRef.current}/${maxFetchAttempts})`
        );

        // Add progressive timeouts to prevent infinite loading
        const timeoutId = setTimeout(() => {
          console.warn("[ROOM DETAILS] Initial fetch timeout, continuing...");

          toast.loading("Still connecting to room...", {
            id: "fetch-timeout",
            duration: 10000,
          });

          // Add a second extended timeout
          const extendedTimeoutId = setTimeout(() => {
            if (!isAborted.current) {
              console.error(
                "[ROOM DETAILS] Extended fetch timeout - giving user options"
              );
              setIsLoading(false);

              toast.error(
                "Room is taking longer than expected to load. Would you like to continue waiting or go back?",
                {
                  id: "fetch-timeout",
                  duration: 15000,
                  action: {
                    label: "Keep Waiting",
                    onClick: () => {
                      setIsLoading(true);
                      toast.loading("Continuing to wait...", {
                        id: "fetch-timeout",
                        duration: 20000,
                      });
                      fetchRoomDetails();
                    },
                  },
                  cancel: {
                    label: "Go Back",
                    onClick: () => {
                      router.push("/");
                    },
                  },
                }
              );
            }
          }, 20000); // Additional 20 seconds

          // Clean up both timeouts on abort
          abortController.signal.addEventListener("abort", () => {
            clearTimeout(extendedTimeoutId);
          });
        }, 15000); // Initial 15 seconds

        // Get room data without forcing a refresh first
        const { data, error } = await supabase
          .from("trading_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        if (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("[ROOM DETAILS] Fetch aborted, retrying...");
            // Don't increment the retry counter for aborted requests
            if (!isAborted.current) {
              setTimeout(() => {
                fetchRoomDetails();
              }, 1000);
            }
          } else {
            console.error("[ROOM DETAILS] Error:", error);
            // If we've tried too many times, give up
            if (fetchAttemptsRef.current >= maxFetchAttempts) {
              setIsLoading(false);
              toast.error(
                "Failed to load room details after multiple attempts"
              );
            } else {
              // Otherwise, try again after a delay
              setTimeout(() => {
                fetchRoomDetails();
              }, 2000);
            }
          }

          return;
        }

        console.log("[ROOM DETAILS] Room data fetched successfully:", data.id);
        setRoomDetails(data);
        fetchAttemptsRef.current = 0; // Reset counter on success

        // ADD THIS LOG to help with debugging
        console.log(
          "[ROOM DETAILS] Room owner ID:",
          data.owner_id,
          "Current user ID:",
          currentUserId
        );

        // Set the selected symbol
        if (data.trading_pairs && data.trading_pairs.length > 0) {
          setSelectedSymbol(data.trading_pairs[0]);
        }

        // Fetch owner name
        try {
          if (data.owner_id) {
            const { data: ownerData, error: ownerError } = await supabase
              .from("users")
              .select("first_name, last_name")
              .eq("id", data.owner_id)
              .single();

            if (ownerError) {
              console.error(
                "[ROOM DETAILS] Error fetching owner data:",
                ownerError
              );
              setOwnerName("Unknown");
            } else if (ownerData) {
              setOwnerName(`${ownerData.first_name} ${ownerData.last_name}`);
            } else {
              setOwnerName("Unknown");
            }
          } else {
            setOwnerName("Unknown");
          }
        } catch (error) {
          console.error("[ROOM DETAILS] Failed to fetch owner:", error);
          setOwnerName("Unknown");
        }

        fetchParticipants(data.participants || []);

        // If current user is the owner, ensure they're in the participants list
        if (currentUserId && currentUserId === data.owner_id) {
          ensureOwnerInParticipants(
            data.id,
            data.participants || [],
            currentUserId
          );
        }

        // Clear the loading timeout since we're done
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }

        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("[ROOM DETAILS] Fetch aborted, retrying...");
          // Don't increment the retry counter for aborted requests
          if (!isAborted.current) {
            setTimeout(() => {
              fetchRoomDetails();
            }, 1000);
          }
        } else {
          console.error("[ROOM DETAILS] Error:", error);
          // If we've tried too many times, give up
          if (fetchAttemptsRef.current >= maxFetchAttempts) {
            setIsLoading(false);
            toast.error("Failed to load room details after multiple attempts");
          } else {
            // Otherwise, try again after a delay
            setTimeout(() => {
              fetchRoomDetails();
            }, 2000);
          }
        }
      } finally {
        if (fetchAttemptsRef.current >= maxFetchAttempts) {
          setIsLoading(false);
        }
      }
    };

    if (roomId) {
      fetchRoomDetails();
    }

    // Set up real-time subscription for room updates
    const roomSubscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trading_rooms",
          filter: `id=eq.${roomId}`,
        },
        async (payload) => {
          console.log("[ROOM DETAILS] Room update received:", payload.new);
          const updatedRoom = payload.new as RoomData;
          setRoomDetails(updatedRoom);

          // When room is updated, always refresh participants
          if (updatedRoom.participants) {
            console.log(
              "[ROOM DETAILS] Room updated, refreshing participants:",
              updatedRoom.participants
            );
            fetchParticipants(updatedRoom.participants);
          }
        }
      )
      .subscribe((status) => {
        console.log(
          `[ROOM DETAILS] Subscription status for room:${roomId}:`,
          status
        );
      });

    return () => {
      console.log(`[ROOM DETAILS] Cleaning up subscription for room:${roomId}`);
      const abortController = new AbortController();
      const isAborted = { current: false };
      isAborted.current = true;
      abortController.abort();
      supabase.removeChannel(roomSubscription);

      // Clear all existing timeouts
      if (loadingTimeoutRef.current) {
        if (Array.isArray(loadingTimeoutRef.current)) {
          loadingTimeoutRef.current.forEach((id) => clearTimeout(id));
        } else {
          clearTimeout(loadingTimeoutRef.current);
        }
        loadingTimeoutRef.current = null;
      }

      // Clear any existing toasts
      toast.dismiss("room-loading");
      toast.dismiss("fetch-timeout");
    };
  }, [
    roomId,
    router,
    roomData,
    fetchParticipants,
    currentUserId,
    ensureOwnerInParticipants,
    maxFetchAttempts,
  ]);

  // Force refresh participants on a regular interval
  useEffect(() => {
    const refreshInterval = 5000; // 5 seconds

    // Only attempt to refresh participants if we have room details and it's been more than 5 seconds
    const intervalId = setInterval(() => {
      if (
        roomDetails &&
        roomDetails.participants &&
        Date.now() - lastParticipantsFetch > refreshInterval
      ) {
        console.log("[ROOM DETAILS] Forcing participants refresh");

        // Force a fresh fetch from the database
        const refreshRoomData = async () => {
          try {
            const { data, error } = await supabase
              .from("trading_rooms")
              .select("participants")
              .eq("id", roomDetails.id)
              .single();

            if (error) {
              console.error(
                "[ROOM DETAILS] Error refreshing room data:",
                error
              );
            } else if (data && data.participants) {
              console.log(
                "[ROOM DETAILS] Refreshed participants from database:",
                data.participants
              );
              fetchParticipants(data.participants);
            }
          } catch (error) {
            console.error("[ROOM DETAILS] Failed to refresh room data:", error);
          }
        };

        refreshRoomData();
      }
    }, refreshInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [roomDetails, fetchParticipants, lastParticipantsFetch]);

  return {
    roomDetails,
    isLoading,
    participants,
    ownerName,
    selectedSymbol,
    setSelectedSymbol,
    setRoomDetails,
    fetchParticipants: () => fetchParticipants(roomDetails?.participants || []),
  };
}
