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
