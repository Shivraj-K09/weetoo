# TRADING SIMULATION SYSTEM FIXES

## IDENTIFIED ISSUES

### Critical Balance Issues

1. ⬜ Virtual currency not updating after trades (balance stays the same)
2. ⬜ Balance decreasing on every trade instead of just reserving the amount
3. ⬜ PnL not being added back to balance when positions are closed

### Position Tracking Fixes

4. ⬜ Positions not showing correct PnL values (showing 0% in history)
5. ⬜ Entry and exit prices showing the same value in trade history
6. ⬜ Position markers not appearing on the TradingView chart
7. ⬜ Profit rate calculation not increasing properly

### Missing Features

8. ⬜ No confirmation dialog when opening/closing positions
9. ⬜ No PnL indicator directly on the chart
10. ⬜ Improper fee calculation based on order type and leverage
11. ⬜ No partial position closing functionality with percentage options

### UI/UX Improvements

12. ⬜ Incomplete position information display in positions panel
13. ⬜ Lack of visual feedback when positions are opened/closed
14. ⬜ No real-time PnL updates without page refresh

## IMPLEMENTATION PLAN

### PHASE 1: Fix Critical Balance Issues

- Fix execute_trade SQL function to properly handle virtual currency
- Fix close_position SQL function to correctly calculate and apply PnL
- Update trading-actions.ts to ensure proper balance management
- Fix useTrading hook to correctly handle balance updates

### PHASE 2: Fix Position Tracking

- Fix PnL calculation in SQL functions
- Ensure trade history correctly records different entry and exit prices
- Implement position markers on the TradingView chart
- Fix profit rate calculation in SQL functions

### PHASE 3: Add Missing Features

- Implement confirmation dialog for trades
- Add PnL indicator overlay on the chart
- Implement proper fee calculation
- Add partial position closing functionality

### PHASE 4: Improve User Experience

- Enhance position information display
- Add visual feedback for trade actions
- Implement real-time PnL updates

## DETAILED STEPS FOR PHASE 1

1. Fix execute_trade SQL function:

   - Ensure virtual currency is properly reserved but not removed from balance
   - Add proper transaction handling
   - Fix error handling

2. Fix close_position SQL function:

   - Ensure correct PnL calculation
   - Properly update virtual currency balance with PnL
   - Fix transaction handling

3. Update trading-actions.ts:

   - Fix balance management in executeTrade function
   - Ensure closePosition correctly handles PnL
   - Add proper error handling and logging

4. Fix useTrading hook:
   - Ensure proper integration with virtual currency management
   - Fix balance update logic
   - Improve error handling and user feedback

## TESTING PLAN

After implementing each phase:

1. Open a position and verify balance is correctly reserved
2. Close a position with profit and verify balance increases
3. Close a position with loss and verify balance decreases appropriately
4. Check trade history for correct entry/exit prices and PnL
5. Verify all UI elements update correctly without page refresh

$95,057.73
$95,057.73
