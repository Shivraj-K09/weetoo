# WebRTC Broadcasting Implementation Plan

## Core Implementation Tasks

### 1. Add Broadcast Fields to Database

- **Difficulty:** Easy
- **Priority:** High
- **Description:** Update Supabase trading_rooms table to include is_broadcasting (boolean) and broadcast_started_at (timestamp) fields to track broadcast status.

### 2. Create Host Broadcasting UI

- **Difficulty:** Medium
- **Priority:** High
- **Description:** Implement the UI components for the room owner to start/stop broadcasting and toggle camera/mic. Add this to the existing room header where the "Start Streaming" button is currently placed.

### 3. Implement Media Device Access

- **Difficulty:** Medium
- **Priority:** High
- **Description:** Create functions to request and manage camera and microphone access. Include a preview video for the host to see themselves before going live.

### 4. Set Up Socket.io Signaling Server

- **Difficulty:** Medium
- **Priority:** High
- **Description:** Create a Socket.io server using Next.js API routes for WebRTC signaling. Implement room-based connections where users join socket rooms based on trading room ID.

### 5. Implement Basic WebRTC for Host

- **Difficulty:** Hard
- **Priority:** High
- **Description:** Set up WebRTC PeerConnection creation, media stream capture, and offer generation for the broadcasting side. Connect this to the Socket.io signaling.

### 6. Create Viewer UI Component

- **Difficulty:** Medium
- **Priority:** Medium
- **Description:** Develop the video player component for participants to view the broadcast, including waiting state, volume controls, and fullscreen toggle.

### 7. Implement WebRTC for Viewers

- **Difficulty:** Hard
- **Priority:** High
- **Description:** Create the viewer-side WebRTC connection handling, including answer generation and remote stream attachment to the video element.

### 8. Add Broadcast State Management

- **Difficulty:** Medium
- **Priority:** Medium
- **Description:** Implement functions to update room status in Supabase when broadcast starts/stops and notify participants of status changes.

### 9. Configure STUN/TURN Servers

- **Difficulty:** Medium
- **Priority:** High
- **Description:** Set up STUN servers for NAT traversal and TURN servers as fallback for when direct connections fail. Essential for WebRTC to work across different networks.

### 10. Implement Connection Monitoring

- **Difficulty:** Medium
- **Priority:** Low
- **Description:** Add network quality indicators and statistics collection to monitor connection health. Create reconnection logic for dropped connections.

### 11. Add Security Checks

- **Difficulty:** Medium
- **Priority:** High
- **Description:** Implement authentication checks to ensure only room owners can broadcast. Add encryption verification for WebRTC connections.

### 12. Create Resource Cleanup Functions

- **Difficulty:** Medium
- **Priority:** Medium
- **Description:** Ensure proper cleanup of media streams, peer connections, and socket connections when broadcasts end or users leave to prevent memory leaks.

### 13. Add Browser Compatibility Handling

- **Difficulty:** Medium
- **Priority:** Medium
- **Description:** Implement feature detection for WebRTC support and graceful fallbacks for unsupported browsers. Test specifically with Safari.

### 14. Implement Error Handling

- **Difficulty:** Medium
- **Priority:** Medium
- **Description:** Add comprehensive error handling for permission denials, connection failures, and other potential issues. Create user-friendly error messages.

### 15. Add UI Polish and Transitions

- **Difficulty:** Easy
- **Priority:** Low
- **Description:** Refine the UI with proper loading states, transitions, and visual feedback for both host and participants.

## Advanced Features (For Later Iterations)

### 16. Implement Adaptive Bitrate

- **Difficulty:** Hard
- **Priority:** Low
- **Description:** Add functionality to adjust video quality based on network conditions. Implement simulcast for better quality adaptation.

### 17. Create Scaling Solution

- **Difficulty:** Hard
- **Priority:** Low
- **Description:** Implement a solution for handling rooms with larger numbers of viewers (10+), potentially using a selective forwarding unit (SFU).

### 18. Add Recording Capability

- **Difficulty:** Hard
- **Priority:** Low
- **Description:** Implement functionality to record broadcasts for later playback. Include storage and retrieval mechanisms.

### 19. Implement Screen Sharing

- **Difficulty:** Medium
- **Priority:** Low
- **Description:** Add the ability for hosts to share their screen in addition to camera feed. Include controls to switch between camera and screen.

### 20. Create Analytics Dashboard

- **Difficulty:** Medium
- **Priority:** Low
- **Description:** Develop a dashboard for tracking broadcast metrics like viewer count, duration, and quality statistics.

## First Implementation Sprint

For your first implementation sprint, focus on these high-priority tasks:

1. Add Broadcast Fields to Database (Easy, High)
2. Create Host Broadcasting UI (Medium, High)
3. Implement Media Device Access (Medium, High)
4. Set Up Socket.io Signaling Server (Medium, High)
5. Configure STUN/TURN Servers (Medium, High)
6. Implement Basic WebRTC for Host (Hard, High)
7. Create Viewer UI Component (Medium, Medium)
8. Implement WebRTC for Viewers (Hard, High)

This gives you a complete end-to-end implementation of the core broadcasting functionality that you can then refine and enhance in subsequent sprints.

Error: Error subscribing to messages
at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:879:71)
at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1052:56)
at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1191:56)
at UserChat.useCallback[setupRealtimeSubscription] (http://localhost:3000/_next/static/chunks/\_adc98cf2._.js:1448:37)
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4084:84
at Object.callback (http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4420:239)
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4348:22
at Array.map (<anonymous>)
at RealtimeChannel._trigger (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4333:16)
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4875:50
at Array.forEach (<anonymous>)
at RealtimeClient._triggerChanError (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4875:23)
at RealtimeClient._onConnClose (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4864:14)
at conn.onclose (http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4817:47)

Error: Channel error
at createUnhandledError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:879:71)
at handleClientError (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1052:56)
at console.error (http://localhost:3000/_next/static/chunks/node_modules_next_dist_client_c24f7707._.js:1191:56)
at http://localhost:3000/_next/static/chunks/\_adc98cf2._.js:1152:29
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4084:84
at Object.callback (http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4420:239)
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4348:22
at Array.map (<anonymous>)
at RealtimeChannel._trigger (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4333:16)
at http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4875:50
at Array.forEach (<anonymous>)
at RealtimeClient._triggerChanError (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4875:23)
at RealtimeClient._onConnClose (http://localhost:3000/\_next/static/chunks/node_modules_fd3d4d93._.js:4864:14)
at conn.onclose (http://localhost:3000/_next/static/chunks/node_modules_fd3d4d93._.js:4817:47)

For the global chats error need to fix this.

implement the funding fee (펀딩비) feature as it plays a crucial role in simulated trading!

✅Implementable Structure for Funding Fees in Simulated Trading Broadcasts1. Core Structure Can Be Maintained

• Binance's funding fee formula and logic can be directly applied.• When users hold long/short positions,
funding fees are calculated based on the premium index and interest rate.
• At each interval (e.g., every 8 hours),
PnL is updated per position accordingly.2. Real-Time Price Data Integration (Recommended)
• Binance API offers direct access to Mark Price, Index Price, and Funding Rate.• Even in a simulated environment, using these APIs enables accurate application of real-world funding mechanics.
🎯Example:• A user holds 1 BTC in a BTCUSDT futures position.
• Every 8 hours, retrieve the relevant funding rate via Binance API.• Multiply the rate by position size and update the user’s virtual asset accordingly. 3. Automated Funding Event Scheduling• Backend can implement a funding timer at set intervals:
◦ 00:00, 08:00, 16:00, etc.• Update user portfolios based on positions at the time of funding.
💡 Implementation TipsItemMethodMark PriceUse premiumIndex from Binance APIIndex PriceAvailable in the same APIFunding RateApply actual Binance funding rate directlyPosition TrackingUse internal DB to track each user’s mock positionApplication LogicAt funding time, update user’s balance accordinglyVisualizationShow timer, next funding rate, and history on the broadcast screen🚧 Cautions
• Funding fees only make sense when there’s a real imbalance between long and short positions.• Even in a simulation, there should be a basic distribution of user positions.
• Optionally, simulate market behavior using virtual order book or AI participants.• Prevent users from exploiting funding-only strategies.
◦ Consider strategy restrictions or display guidance to avoid abuse.🎁 If needed, I can provide:
• ✅ Sample Python code to pull real Binance funding rates and apply them• ✅ UI mockups for funding fee display on the trading broadcast screen
• ✅ Backend module design for funding fee calculations
