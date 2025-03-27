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
