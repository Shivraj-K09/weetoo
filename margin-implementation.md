# Trading Margin & Balance Display Implementation Plan

## 1. Initial Margin Display Implementation

### Database Changes

1. ✅ Modify the `trading_positions` table to add a new column:

   - ✅ Add `initial_margin` DECIMAL column to store the calculated initial margin

2. ✅ Update the `execute_trade` function in SQL:
   - ✅ Calculate initial margin using: (Quantity × Entry Price ÷ Leverage) + (Entry Price × Fee Rate)
   - ✅ For market orders: Fee Rate = 0.06%
   - ✅ For limit orders: Fee Rate = 0.02%
   - ✅ Store this value in the new `initial_margin` column

### Backend Changes

1. ✅ Update `app/actions/trading-actions.ts`:

   - ✅ Modify the `executeTrade` function to pass order type to the SQL function
   - ✅ Add order type parameter to determine fee rate (market: 0.06%, limit: 0.02%)
   - ✅ Update return types to include initial margin information

2. ✅ Update position retrieval functions to include initial margin:
   - ✅ Modify `getRoomPositions` to include initial margin in the returned data
   - ✅ Update any relevant interfaces to include initial margin

### Frontend Changes

1. ✅ Update `types/index.ts`:

   - ✅ Add `initial_margin` to the Position interface
   - ✅ Add `order_type` to relevant interfaces if not already present

2. ✅ Update `components/room/positions-panel.tsx`:

   - ✅ Add a column for "Initial Margin" in the positions table
   - ✅ Format and display the initial margin value for each position

3. ✅ Update `hooks/use-trading.ts`:
   - ✅ Modify to handle the new initial margin concept
   - ✅ Update position tracking to include initial margin

## 2. Balance Display Logic Changes

### Backend Changes

1. ✅ Create a new function in SQL to calculate available balance:

   - ✅ Create `calculate_available_balance` function that:
     - ✅ Takes user_id and room_id as parameters
     - ✅ Sums up initial_margin for all open positions
     - ✅ Returns (total_balance - sum_of_initial_margins)

2. ✅ Update `app/actions/virtual-currency-actions.ts`:
   - ✅ Add a new function to get detailed balance information
   - ✅ Return an object with holdings, initial margin, available, and valuation

### Frontend Changes

1. ✅ Create a new hook `use-detailed-balance.ts`:

   - ✅ Implement real-time tracking of all balance metrics
   - ✅ Calculate and provide holdings, initial margin, available, and valuation

2. ✅ Update `components/room/virtual-currency-display.tsx`:

   - ✅ Modify to show all four balance metrics
   - ✅ Add tooltips explaining each balance type
   - ✅ Format numbers consistently

3. ✅ Update `components/room/trading-form.tsx`:
   - ✅ Change validation to check against available balance instead of total balance
   - ✅ Update displayed balance information
   - ✅ Add explanatory tooltips about margin requirements

## 3. Partial Close Feature Enhancement

### Frontend Changes

1. ✅ Update `components/room/position-details.tsx`:

   - ✅ Add quick-select buttons for 25%, 50%, 75%, and 100%
   - ✅ Keep the slider for fine-tuning
   - ✅ Improve the UI layout to make partial close options more prominent

2. ✅ Update `components/room/positions-panel.tsx`:

   - ✅ Add dropdown or quick buttons for partial close percentages
   - ✅ Make the partial close feature more accessible from the main positions list
   - ✅ Consider adding tooltips explaining the partial close feature

3. ✅ Update the partial close handler functions:
   - ✅ Ensure the percentage selection is properly passed to the backend
   - ✅ Add visual feedback during the partial close process

## Implementation Order

1. ✅ Start with database changes
2. ✅ Implement backend logic changes
3. ✅ Update types and interfaces
4. ✅ Implement frontend components
5. ✅ Polish UI and add explanatory tooltips
