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
  levelProgress?: number;
  notifications?: number;
  provider_type?: string;
  role?: string;
}
