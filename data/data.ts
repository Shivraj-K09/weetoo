import type { User } from "@/types";

// Generate 30 users for the two tables
export const users: User[] = [
  { id: 1, name: "튜빵애비", coins: 3500000 },
  { id: 2, name: "쏘나기", coins: 3500000 },
  { id: 3, name: "규주키", coins: 3500000 },
  { id: 4, name: "남자는한길", coins: 3500000 },
  { id: 5, name: "할매요", coins: 3500000 },
  { id: 6, name: "앤트1293", coins: 3500000 },
  { id: 7, name: "test1123", coins: 3500000 },
  { id: 8, name: "튜빵애비", coins: 3500000 },
  { id: 9, name: "쏘나기", coins: 3500000 },
  { id: 10, name: "규주키", coins: 3500000 },
  { id: 11, name: "남자는한길", coins: 3500000 },
  { id: 12, name: "할매요", coins: 3500000 },
  { id: 13, name: "앤트1293", coins: 3500000 },
  { id: 14, name: "test1123", coins: 3500000 },
  { id: 15, name: "튜빵애비", coins: 3500000 },

  { id: 16, name: "튜빵애비", coins: 3500000 },
  { id: 17, name: "쏘나기", coins: 3500000 },
  { id: 18, name: "규주키", coins: 3500000 },
  { id: 19, name: "남자는한길", coins: 3500000 },
  { id: 20, name: "할매요", coins: 3500000 },
  { id: 21, name: "앤트1293", coins: 3500000 },
  { id: 22, name: "test1123", coins: 3500000 },
  { id: 23, name: "튜빵애비", coins: 3500000 },
  { id: 24, name: "쏘나기", coins: 3500000 },
  { id: 25, name: "규주키", coins: 3500000 },
  { id: 26, name: "남자는한길", coins: 3500000 },
  { id: 27, name: "할매요", coins: 3500000 },
  { id: 28, name: "앤트1293", coins: 3500000 },
  { id: 29, name: "test1123", coins: 3500000 },
  { id: 30, name: "튜빵애비", coins: 3500000 },
];

// Split users into two tables
export const leftTableUsers = users.slice(0, 15);
export const rightTableUsers = users.slice(15, 30);
