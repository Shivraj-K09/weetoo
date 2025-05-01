export interface User {
  id: number;
  name: string;
  coins: number;
}

export interface TraderRanking {
  id: number;
  name: string;
  return: number;
  numberOfTrades: number;
}

export interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: Date;
  source: string;
  category: string;
  relevanceScore: number;
}
export interface CurrencyData {
  symbol: string;
  price: string;
  change: string;
  pips: string;
  high: string;
  low: string;
  chartData: number[];
  backgroundColor?: string;
  isLive?: boolean;
}

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PerformanceItem {
  label: string;
  value: string;
  color: string;
}

// Supabase User Profile type
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  kor_coins?: number;
  level?: number;
  exp?: number;
  levelProgress?: number;
  notifications?: number;
  provider_type?: string;
  role?: string;
  nickname?: string;
  provider?: string;
}

export interface SupabaseUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  avatar_url: string | null;
  provider_type: string | null;
  created_at: string;
  updated_at: string;
  kor_coins: number;
  naver_id: string | null;
  role: string;
  status: string;
  warnings: number;
}

export interface Post {
  id: string;
  created_at: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  tags: string[];
  featured_images: string[];
  view_count: number;
  updated_at: string;
  status: string;
  moderated_by?: string | null;
  moderated_at?: string | null;
  points_awarded?: boolean;
  // Join with users table
  user?: SupabaseUser;
  // Join with moderator user
  moderator?: {
    first_name: string | null;
    last_name: string | null;
  };
}

export type Privacy = "private" | "public";
export type RoomCategory = "regular" | "voice";

export interface Room {
  id: string;
  title: string;
  symbol: string;
  privacy: Privacy;
  createdAt: Date;
  username: string;
  roomCategory?: RoomCategory;
  owner_id: string;
}

export interface RoomData {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  owner_id: string;
  created_at: string;
  users: UserData | UserData[];
  room_category?: RoomCategory;
}

export interface UserData {
  first_name: string;
  last_name: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  is_host: boolean;
  message: string;
  timestamp: number;
}

export interface Message {
  id: string;
  status: "read" | "unread";
  type: "normal" | "important" | "ad";
  sender: string;
  title: string;
  date: string;
  time: string;
}

export interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
}

export interface PointsData {
  totalPoints: number;
  availablePoints: number;
  transactions: Transaction[];
}

export interface Platform {
  id: string;
  name: string;
  logo: string;
  color: string;
  status: string;
  registered: boolean;
  disabled?: boolean;
}

export interface Position {
  id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  entry_amount: number;
  leverage: number;
  position_size: number;
  current_price: number;
  current_pnl?: number;
  pnl_percentage?: number;
  status: "open" | "closed" | "partially_closed";
  created_at: string;
  updated_at: string;
  stop_loss?: number;
  take_profit?: number;
  order_type?: "market" | "limit";
  initial_margin?: number;
  cumulative_funding_fee?: number | null;
}

export interface Trade {
  id: string;
  position_id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  entry_amount: number;
  leverage: number;
  position_size: number;
  trade_volume: number;
  pnl: number;
  pnl_percentage: number;
  entry_time: string;
  exit_time: string;
}

export interface TradeHistory {
  id: string;
  position_id: string;
  room_id: string;
  user_id: string;
  symbol: string;
  direction: "buy" | "sell";
  entry_price: number;
  exit_price: number;
  entry_amount: number;
  leverage: number;
  position_size: number;
  trade_volume: number;
  pnl: number;
  pnl_percentage: number;
  entry_time: string;
  exit_time: string;
  created_at: string;
}

export interface RoomDetails {
  id: string;
  room_name: string;
  room_type: Privacy;
  trading_pairs: string[];
  current_participants: number;
  max_participants: number;
  owner_id: string;
  participants: string[];
  created_at: string;
}
