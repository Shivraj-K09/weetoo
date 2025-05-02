# Margin Calculation Fix Plan

## Current Issues

- Initial Margin formula is incorrect
- Virtual currency is being deducted when opening positions instead of just locking margin
- Balance display doesn't properly show Holdings vs Available vs Valuation

## How Margin Trading Should Work

1. When a trader opens a position, they don't "spend" the entry amount
2. Instead, a portion of their balance (the margin) is locked as collateral
3. The margin remains in their account but can't be used for other trades
4. When the position is closed, the margin is released plus/minus any profit/loss

## Correct Formula

Initial Margin = (Position Size ÷ Leverage) + (Position Size × Fee Rate)

Fee rates:

- Market Order: 0.06% (0.0006)
- Limit Order: 0.02% (0.0002)

## Implementation Steps

### ✅ Step 1: Fix the margin calculation in virtual-currency-display.tsx

- Update the formula to correctly calculate margin
- Add detailed logging for debugging

### ✅ Step 2: Update database schema

- Add locked_margin column to trading_rooms table
- Ensure initial_margin column exists in trading_positions table
- Create a view for easy balance calculations

### ✅ Step 3: Update trading functions

- Modify execute_trade to lock margin instead of deducting from balance
- Update close_position to release margin and add P&L to balance

### ✅ Step 4: Update trading actions

- Add getRoomBalanceDetails function to fetch detailed balance info
- Update executeTrade to use the new margin system
- Update closePosition to handle margin release correctly

### ✅ Step 5: Create a detailed balance hook

- Implement useDetailedBalance hook to get balance details
- Include holdings, locked margin, available, unrealized P&L, and valuation

### ✅ Step 6: Update UI components

- Update virtual-currency-display.tsx to use the new balance details
- Ensure trading form shows correct available balance
- Fix type issues in use-trading.ts by importing correct types

### Step 7: Test the changes

- Test opening positions with different leverage and order types
- Verify margin is locked but not deducted
- Test closing positions and verify margin is released
- Check all balance displays are correct

## Example Calculation

For a position with:

- Quantity: 1 BTC
- Entry Price: 94,605.80 USDT
- Leverage: 10x
- Order Type: Market (0.06% fee)

Initial Margin = (1 × 94,605.80 ÷ 10) + (94,605.80 × 0.0006)
= 9,460.58 + 56.76
= 9,517.34 USDT

## Balance Display Logic

- Holdings: Total wallet balance (constant until P&L is realized)
- Initial Margin: Sum of margin required for all open positions
- Available: Holdings - Initial Margin
- Unrealized P&L: Sum of current P&L from all open positions
- Valuation: Holdings + Unrealized P&L
