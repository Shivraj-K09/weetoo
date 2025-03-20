"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  Send,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function News() {
  const [filter, setFilter] = useState("Latest");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;
  const itemsPerPage = 8;

  // Generate a larger dataset for pagination
  const generateNewsData = () => {
    const categories = ["Category A", "Category B", "Category C", "Category D"];
    const titles = [
      "Bitcoin Price Surges Past $60,000",
      "New Cryptocurrency Exchange Launches",
      "Ethereum 2.0 Update Scheduled",
      "NFT Market Reaches New Heights",
      "Regulatory Changes Impact Crypto Trading",
      "DeFi Protocols See Increased Adoption",
      "Major Bank Adds Crypto Custody Services",
      "Mining Difficulty Increases by 15%",
      "New Stablecoin Project Announced",
      "Blockchain Technology in Supply Chain",
      "Crypto Lending Platform Expands Services",
      "Security Concerns in Smart Contracts",
      "Central Bank Digital Currencies Progress",
      "Crypto Tax Reporting Requirements Updated",
      "Cross-Chain Bridge Technology Advances",
    ];

    return Array.from({ length: totalPages * itemsPerPage }, (_, i) => ({
      id: i + 1,
      title:
        titles[i % titles.length] + ` ${Math.floor(i / titles.length) + 1}`,
      content:
        "This is a sample content for the news card. It contains demo text that will be displayed in the card with additional information about the topic.",
      category: categories[i % categories.length],
      time: `${(i % 60) + 1}m`,
      hasImage: i % 3 !== 0, // 2/3 of items have images
    }));
  };

  const allNewsCards = generateNewsData();

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allNewsCards.slice(startIndex, startIndex + itemsPerPage);
  };

  const [displayedNews, setDisplayedNews] = useState(getCurrentPageItems());

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Update displayed news when current page changes
  useEffect(() => {
    setDisplayedNews(getCurrentPageItems());
  }, [currentPage]);

  return (
    <div className="h-full rounded-xls bg-gradient-to-br from-indigo-100 via-white to-teal-100 text-gray-800 p-4 md:p-6 relative">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-15 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header - non-sticky */}
      <div className="flex justify-between items-center mb-6 bg-white/70 -mx-4 md:-mx-6 px-4 md:px-6 py-4 border-b border-gray-200 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 mr-2 font-medium tracking-wide">
              Live
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <div className="h-6 w-px bg-gray-200"></div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white border-gray-200 text-gray-800 hover:bg-gray-50 transition-all duration-200"
              >
                {filter} <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
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
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Page indicator */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-700">Latest News</h2>
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* News Grid without blinking transition */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6 relative">
        {displayedNews.map((card) => (
          <NewsCard
            key={`page-${currentPage}-item-${card.id}`}
            title={card.title}
            content={card.content}
            category={card.category}
            time={card.time}
            hasImage={card.hasImage}
            variant={
              card.category === "Category A"
                ? "primary"
                : card.category === "Category B"
                ? "secondary"
                : card.category === "Category C"
                ? "tertiary"
                : "quaternary"
            }
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-10 mb-4">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-gray-200 bg-white text-gray-500 transition-all duration-200"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              className={`h-9 w-9 transition-all duration-200 ${
                currentPage === page
                  ? "bg-indigo-500 text-white hover:bg-indigo-600"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 border-gray-200 bg-white text-gray-500 transition-all duration-200"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
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
  hasImage?: boolean;
  variant: "primary" | "secondary" | "tertiary" | "quaternary";
}

function NewsCard({
  title,
  content,
  category,
  time,
  hasImage,
  variant,
}: NewsCardProps) {
  const baseStyles =
    "rounded-2xl p-5 h-full flex flex-col transition-all duration-300 hover:translate-y-[-2px] backdrop-blur-sm";
  const variantStyles = {
    primary:
      "bg-gradient-to-br from-indigo-200 to-indigo-50 border-0 hover:shadow-[0_8px_30px_-5px_rgba(99,102,241,0.3)]",
    secondary:
      "bg-gradient-to-br from-teal-200 to-teal-50 border-0 hover:shadow-[0_8px_30px_-5px_rgba(20,184,166,0.3)]",
    tertiary:
      "bg-gradient-to-br from-purple-200 to-purple-50 border-0 hover:shadow-[0_8px_30px_-5px_rgba(168,85,247,0.3)]",
    quaternary:
      "bg-gradient-to-br from-amber-200 to-amber-50 border-0 hover:shadow-[0_8px_30px_-5px_rgba(245,158,11,0.3)]",
  };

  const categoryStyles = {
    primary: "bg-white/60 text-indigo-700",
    secondary: "bg-white/60 text-teal-700",
    tertiary: "bg-white/60 text-purple-700",
    quaternary: "bg-white/60 text-amber-700",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]}`}>
      <h3 className="font-semibold text-lg mb-3 line-clamp-2 tracking-tight text-gray-900">
        {title}
      </h3>
      <div className="flex flex-1 gap-4">
        <div className="flex-1">
          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
            {content}
          </p>
        </div>
        {hasImage && (
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-xl bg-white/50 border border-black/20 shadow-inner"></div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-black/10">
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${categoryStyles[variant]}`}
        >
          {category}
        </span>
        <span className="text-xs font-medium text-gray-600">{time}</span>
      </div>
    </div>
  );
}
