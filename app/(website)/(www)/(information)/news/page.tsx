"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Calendar,
  RefreshCw,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { motion } from "motion/react";

interface NewsItem {
  id?: number;
  title: string;
  content?: string;
  description?: string;
  category?: string;
  time?: string;
  image?: string;
  link?: string;
  pubDate?: string;
  isPlaceholder?: boolean;
}

interface ApiResponse {
  articles: NewsItem[];
  error?: string;
}

export default function News() {
  const [filter, setFilter] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clockTimerRef = useRef<NodeJS.Timeout | null>(null);
  // const itemsPerPage = 9; // Set to 9 items per page (3 rows of 3)

  // Function to fetch news data
  const fetchNews = useCallback(async (page: number, isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const timestamp = new Date().getTime();
      // Force exactly 9 items per page
      const response = await fetch(
        `/api/news?page=${page}&limit=9&t=${timestamp}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const text = await response.text();
      let data: ApiResponse;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error(
          "Failed to parse response as JSON:",
          text.substring(0, 100) + "..."
        );
        console.error(parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (!data.articles || !Array.isArray(data.articles)) {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format");
      }

      if (data.error) {
        console.warn("API returned an error:", data.error);
        setError(`API notice: ${data.error}`);
      }

      // Ensure we have exactly 9 articles
      let formattedNews = data.articles.map((article, index) => ({
        id: index,
        title: article.title,
        content:
          article.description || "Click to read the full article on TokenPost.",
        category: "Blockchain",
        time: article.pubDate || "Recent",
        image: article.image,
        link: article.link,
      }));

      // If we have fewer than 9 articles, add placeholders to make it exactly 9
      if (formattedNews.length < 9) {
        const placeholdersNeeded = 9 - formattedNews.length;
        for (let i = 0; i < placeholdersNeeded; i++) {
          formattedNews.push({
            id: formattedNews.length + i,
            title: "",
            content: "",
            category: "",
            time: "",
            image: "",
            link: "",
          });
        }
      }

      // If we have more than 9 articles, truncate to exactly 9
      if (formattedNews.length > 9) {
        formattedNews = formattedNews.slice(0, 9);
      }

      setNewsData(formattedNews);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch news:", err);
      setError(
        `Failed to load news: ${
          err instanceof Error ? err.message : "Unknown error"
        }. Using fallback data.`
      );

      // Generate exactly 9 fallback items
      setNewsData(generateFallbackData(9));
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      }, 500);
    }
  }, []);

  // Function to manually refresh news
  // const handleRefresh = useCallback(() => {
  //   fetchNews(currentPage);
  // }, [fetchNews, currentPage]);

  // Function to generate fallback data
  const generateFallbackData = (count = 9): NewsItem[] => {
    const categories = ["Blockchain", "Cryptocurrency", "NFT", "DeFi"];
    const titles = [
      "Bitcoin Price Surges Past $60,000",
      "New Cryptocurrency Exchange Launches",
      "Ethereum 2.0 Update Scheduled",
      "NFT Market Reaches New Heights",
      "Regulatory Changes Impact Crypto Trading",
      "DeFi Protocols See Increased Adoption",
      "Major Bank Adds Crypto Custody Services",
      "Mining Difficulty Increases by 15%",
      "New Blockchain Platform Announced",
    ];

    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: titles[i % titles.length],
      content:
        "This is a sample content for the news card. It contains demo text that will be displayed in the card with additional information about the topic.",
      category: categories[i % categories.length],
      time: `${(i % 60) + 1}m`,
      image: "",
    }));
  };

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      fetchNews(page);
    }
  };

  // Set up auto-refresh timer for news
  useEffect(() => {
    // Initial fetch
    fetchNews(currentPage);

    // Set up auto-refresh every 5 seconds (5000 ms) instead of 5 minutes
    refreshTimerRef.current = setInterval(() => {
      fetchNews(currentPage, true);
    }, 5000);

    // Clean up timer on unmount
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [currentPage, fetchNews]);

  // Set up timer for continuously updating clock
  useEffect(() => {
    // Update the clock every second
    clockTimerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up timer on unmount
    return () => {
      if (clockTimerRef.current) {
        clearInterval(clockTimerRef.current);
      }
    };
  }, []);

  // Update when filter changes
  useEffect(() => {
    fetchNews(currentPage);
  }, [filter, fetchNews, currentPage]);

  // Format the current time
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format the last refreshed time
  // const formatLastRefreshed = () => {
  //   return lastRefreshed.toLocaleTimeString([], {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     second: "2-digit",
  //   });
  // };

  // Calculate seconds until next refresh
  const getSecondsUntilRefresh = () => {
    const timeSinceLastRefresh = new Date().getTime() - lastRefreshed.getTime();
    const secondsUntilRefresh = 5 - Math.floor(timeSinceLastRefresh / 1000);
    return secondsUntilRefresh > 0 ? secondsUntilRefresh : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50 text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 shadow-sm backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                News Feed
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white border-gray-200 text-gray-800 hover:bg-gray-50 transition-all duration-200"
                  >
                    {filter} <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white text-gray-800 border-gray-200">
                  <DropdownMenuItem
                    onClick={() => setFilter("Latest")}
                    className="hover:bg-gray-50 focus:bg-gray-50"
                  >
                    Latest
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilter("Popular")}
                    className="hover:bg-gray-50 focus:bg-gray-50"
                  >
                    Popular
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title and refresh section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Latest Blockchain News
            </h2>
            <p className="text-gray-500">
              Stay updated with the latest developments in blockchain technology
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center">
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw
                className={`h-3 w-3 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span>
                <span className="font-mono" suppressHydrationWarning>
                  {formatCurrentTime()}
                </span>{" "}
                • Auto-refresh in {getSecondsUntilRefresh()}s
              </span>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        {/* News Grid with Skeleton loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {isLoading ? (
            // Skeleton loading cards - show exactly 9 skeletons
            Array.from({ length: 9 }).map((_, index) => (
              <SkeletonNewsCard key={index} />
            ))
          ) : newsData.length > 0 ? (
            // Actual news cards
            newsData.map((card, index) =>
              card.isPlaceholder ? (
                // Invisible placeholder to maintain grid layout
                <div key={`placeholder-${index}`} className="hidden md:block" />
              ) : (
                <motion.div
                  key={`${card.title}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index * 0.05, 0.5),
                  }}
                >
                  <NewsCard
                    title={card.title}
                    content={card.content || ""}
                    category={card.category || "Blockchain"}
                    time={card.time || ""}
                    imageUrl={card.image}
                    link={card.link}
                  />
                </motion.div>
              )
            )
          ) : (
            // Empty state
            <div className="col-span-3 flex justify-center items-center py-20 text-gray-500 text-sm">
              No news articles found.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-10 mb-4">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-200 bg-white text-gray-500 transition-all duration-200"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5) {
                if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  className={`h-10 w-10 transition-all duration-200 ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-0"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isLoading}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-200 bg-white text-gray-500 transition-all duration-200"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

// Skeleton loading card
function SkeletonNewsCard() {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
      {/* Skeleton image - top */}
      <div className="w-full h-48 relative">
        <Skeleton className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300" />
      </div>

      {/* Skeleton content - bottom */}
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-24 rounded-full bg-gradient-to-r from-blue-200 to-purple-200" />
          <Skeleton className="h-5 w-20 bg-gradient-to-r from-gray-200 to-gray-300" />
        </div>

        <Skeleton className="h-6 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
        <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-gray-200 to-gray-300" />

        <Skeleton className="h-4 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
        <Skeleton className="h-4 w-5/6 bg-gradient-to-r from-gray-200 to-gray-300" />

        <div className="flex justify-between pt-2">
          <Skeleton className="h-6 w-24 bg-gradient-to-r from-blue-200 to-purple-200" />
          <Skeleton className="h-6 w-20 bg-gradient-to-r from-gray-200 to-gray-300" />
        </div>
      </div>
    </div>
  );
}

interface NewsCardProps {
  title: string;
  content: string;
  category: string;
  time: string;
  imageUrl?: string;
  link?: string;
}

function NewsCard({
  title,
  content,
  category,
  time,
  imageUrl,
  link,
}: NewsCardProps) {
  const handleCardClick = () => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-white to-blue-50 rounded-lg overflow-hidden shadow-md border border-blue-100 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col group"
      onClick={handleCardClick}
    >
      {/* Top section - Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageUrl || ""}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "";
          }}
        />
        {/* Image overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 via-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Bottom section - Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Badges and time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              TokenPost
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <Tag className="h-3 w-3 mr-1" />
              {category}
            </span>
          </div>
          <span className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {time}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-grow">
          {content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-end mt-auto pt-3 border-t border-blue-100">
          {/* Read more link */}
          {link && (
            <div className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-sm font-medium group-hover:underline">
              Read more
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1 text-blue-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
