# Host-Only Trading Implementation Guide

## Overview

This guide explains how to implement a system where only the host can trade, while participants can watch in real-time.

## Step 1: Verify Permission Controls

1. Check that the `isHost` flag is correctly passed to all trading components
2. Ensure the TradingForm component has proper disabled states for non-hosts
3. Verify that the `room-page.tsx` correctly identifies the host using: `const isHost = user?.id === roomDetails?.owner_id`

## Step 2: Update Trading Form UI

1. In `components/room/trading-form.tsx`:
   - Keep the existing disabled buttons for non-hosts
   - Add a clear visual indicator for participants that they are in view-only mode
   - Consider adding a "Host is trading" indicator that appears when trades happen

## Step 3: Enhance Real-Time Subscriptions

1. Verify all participants are subscribed to these channels:
   - `trading_positions` table changes
   - `virtual_currency` updates
   - `trade_history` updates
   - Room state changes

## Step 4: Add Visual Indicators

1. In the Room Header (`components/room/room-header.tsx`):
   - Add a badge next to the host's name indicating they are the host
   - Add a "View Only" badge for participants

## Step 5: Improve Position Updates

1. In `components/room/positions-panel.tsx`:
   - Ensure the real-time subscription is working for all users
   - Add visual indicators when new positions are opened by the host

## Step 6: Test the Implementation

1. Open two browser windows:
   - Log in as the host in one window
   - Log in as a participant in another window
2. Verify that:
   - Only the host can execute trades
   - Participants see all trades in real-time
   - The UI clearly indicates who is the host
   - Participants see appropriate "view only" indicators

## Step 7: Troubleshooting

1. If participants don't see updates:
   - Check Supabase channel subscriptions
   - Verify that the real-time events are being dispatched
   - Check browser console for errors

## Step 8: Optional Enhancements

1. Add a "Host is currently trading..." notification when the host is actively using the trading form
2. Implement a "Host's cursor" feature to show participants where the host is focusing
3. Add a chat notification when the host executes a trade

## Notes

- No code changes are needed for the basic functionality if your permissions are already set up correctly
- The existing real-time infrastructure should handle most of the requirements
- Focus on UI clarity to ensure participants understand they are in view-only mode
