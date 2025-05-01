# Funding Fee Implementation Plan

## Database Setup

✅ Create funding_rates table
✅ Create funding_payments table
✅ Add funding columns to trading_positions table
✅ Set up appropriate indexes for performance
✅ Configure RLS policies for security

## API Integration

✅ Implement Binance API integration
✅ Create service to fetch and store funding rates
✅ Add rate limiting to prevent excessive API calls
✅ Implement error handling and fallbacks
✅ Optimize for performance

## UI Components

✅ Create FundingInfo component to display current rate
✅ Add countdown timer to next funding event
✅ Implement color coding (red/green) for rates
✅ Fix text jumping issues
✅ Optimize loading performance

## Core Functionality

✅ Implement funding calculation service
✅ Create logic to apply fees to positions
✅ Update user balances based on funding fees
✅ Record funding payments in database
✅ Add position funding fee display

## Client-Side Scheduling

✅ Replace cron jobs with client-side solution
✅ Implement scheduler to check for funding times
✅ Add logic to trigger funding at correct times
✅ Prevent duplicate processing with timestamp checks
✅ Implement efficient rate fetching

## Remaining Tasks

⬜ Add funding history view for users
⬜ Create admin dashboard for funding overview
⬜ Implement funding fee notifications
⬜ Add detailed analytics and reporting
⬜ Create comprehensive testing suite

## Notes

- All core functionality is now implemented
- System correctly calculates and applies funding fees
- Users can see funding rates and accumulated fees
- Next step is to enhance the UI with history views

Below are the implementation requirements for displaying Initial Margin in the Trading Room under “Open Positions,” along with improvements needed for the partial close feature.

✅ 1. Initial Margin Calculation Formula
The Initial Margin displayed per position should be calculated as follows:

Initial Margin = (Quantity × Entry Price ÷ Leverage) + (Entry Price × Fee Rate)
Fee rates depend on order type:

Market Order: 0.06%
Limit Order: 0.02%

Example:
Quantity: 1 BTC, Entry Price: 94,605.80, Leverage: 10x, Order Type: Market
→ Initial Margin = (1 × 94,605.80 ÷ 10) + (94,605.80 × 0.0006) ≒ 9,517.34 USDT

✅ 2. Balance Display Logic
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

✅ 3. Partial Close Feature Enhancement
Currently, the partial close function defaults to 50%.
We need to allow the user to select the desired percentage for position reduction:

Add quick-select buttons next to the “Close” action (e.g., 25% / 50% / 75% / 100%)

Optionally, provide a slider for more precise control

Only the selected portion of the position should be closed
