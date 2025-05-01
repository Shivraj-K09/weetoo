# Profit Rate Calculation Implementation Guide

## Overview

This document outlines how to implement the profit rate calculation system in our trading simulation platform. The system will track a user's cumulative profit rate across all trading rooms they create.

## Basic Rules

- Each new trading room starts with $10,000 virtual currency
- If a user loses all money, their profit rate is -100%
- If they lose in multiple rooms, the negative rates accumulate (e.g., -200% after two complete losses)
- If they profit in a room (e.g., grow $10,000 to $20,000), they gain +100% profit rate
- The "Reset Trade History" feature will clear all negative profit rates

## Implementation Steps

### 1. Database Setup ✅

- Create a new table to track each user's overall profit rate
- Add columns to the trading rooms table to track profit for each room
- Set up security so users can only see their own data

### 2. Room Creation Logic ✅

- When a user creates a room, set the initial balance to $10,000
- Record this as the starting point for profit calculation
- Increment a counter for total rooms opened by this user

### 3. Room Closure Logic ✅

- When a room is closed, calculate the final balance
- Calculate the profit rate: ((final - initial) / initial) \* 100
- Update the user's cumulative profit rate

### 4. Reset Feature ✅

- Add a "Reset Trade History" button
- When clicked, check if the user's profit rate is negative
- If negative, reset it to zero
- Mark all rooms as not included in the calculation

### 5. Display Profit Rate ✅

- Show the user's current profit rate in their profile
- Add a profit rate column to the trading rooms list
- Create a leaderboard based on profit rates

### 6. Testing

- Test with different scenarios (profit, loss, break-even)
- Verify cumulative calculations work correctly
- Test the reset feature

## Final Notes

- All calculations should happen server-side for security
- Use database transactions to ensure data consistency
- Cache frequently accessed profit rate data for performance
- Consider adding visual indicators (colors, charts) to make profit/loss more intuitive
