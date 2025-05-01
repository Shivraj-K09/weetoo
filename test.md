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

Below are the implementation requirements for displaying Initial Margin in the Trading Room under “Open Positions,” along with improvements needed for the partial close feature.

1.  Initial Margin Calculation Formula
    The Initial Margin displayed per position should be calculated as follows:

Initial Margin = (Quantity × Entry Price ÷ Leverage) + (Entry Price × Fee Rate)
Fee rates depend on order type:

Market Order: 0.06%
Limit Order: 0.02%

Example:
Quantity: 1 BTC, Entry Price: 94,605.80, Leverage: 10x, Order Type: Market
→ Initial Margin = (1 × 94,605.80 ÷ 10) + (94,605.80 × 0.0006) ≒ 9,517.34 USDT

2.  Balance Display Logic
    Assuming an initial balance of 10,021.26 USDT, the UI should reflect:

Label Description
[Holdings] Initial wallet balance (constant) = 10,021.26
[Initial Margin] Margin required per position based on the above formula
[Available] Holdings – Initial Margin
[Valuation] Holdings + Realized P&L + Unrealized P&L
⚠️ Important:
Upon opening a position, Holdings should NOT be deducted.
The Initial Margin is locked, not spent.
When the position is closed, the margin is released and added back to the Available balance.

3.  Partial Close Feature Enhancement
    Currently, the partial close function defaults to 50%.
    We need to allow the user to select the desired percentage for position reduction:

Add quick-select buttons next to the “Close” action (e.g., 25% / 50% / 75% / 100%)

Optionally, provide a slider for more precise control

Only the selected portion of the position should be closed
