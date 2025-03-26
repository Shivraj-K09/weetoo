"use client";

import type React from "react";

import { ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

// Create interfaces for the items
interface EventItem {
  title: string;
  subtitle?: string;
  description?: string; // Made optional
  period?: string; // Made optional
  color?: string;
  imageColor?: string;
  id?: number;
  image?: string;
  category?: string;
  date?: string;
}

// Event data
const events = [
  {
    title: "절세상품 이벤트 MOVE UP!",
    subtitle: "<영업점 이벤트>",
    description: "한투에서 개인연금, ISA 가입 시 최대 116만원 혜택!",
    period: "2025.01.02 ~ 2025.03.31",
    color: "bg-gradient-to-r from-blue-600 to-blue-500",
    imageColor: "bg-blue-500/20",
  },
  {
    title: "주식재권 이벤트 MOVE UP!",
    subtitle: "<영업점 이벤트>",
    description: "주식, 재권 한투로 이전 시 최대 160만원 혜택!",
    period: "2025.01.02 ~ 2025.03.31",
    color: "bg-gradient-to-r from-indigo-600 to-indigo-500",
    imageColor: "bg-indigo-500/20",
  },
  {
    title: "세금 줄이고 ETF도 받자!!",
    subtitle: "<뱅키스 이벤트>",
    description: "ISA중개형 계좌로 바꾸고 - 세금 줄이고 ETF도 받자~!!",
    period: "2025.01.01 ~ 2025.03.31",
    color: "bg-gradient-to-r from-cyan-600 to-cyan-500",
    imageColor: "bg-cyan-500/20",
  },
  {
    title: "신규 계좌 개설 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "신규 계좌 개설 시 다양한 혜택을 받아보세요!",
    period: "2025.02.01 ~ 2025.04.30",
    color: "bg-gradient-to-r from-blue-600 to-blue-500",
    imageColor: "bg-blue-500/20",
  },
  {
    title: "해외 주식 거래 수수료 이벤트",
    subtitle: "<뱅키스 이벤트>",
    description: "해외 주식 거래 시 수수료 할인 혜택!",
    period: "2025.01.15 ~ 2025.05.15",
    color: "bg-gradient-to-r from-teal-600 to-teal-500",
    imageColor: "bg-teal-500/20",
  },
  {
    title: "연금저축 추가 적립 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "연금저축 추가 적립 시 특별 혜택을 드립니다!",
    period: "2025.03.01 ~ 2025.06.30",
    color: "bg-gradient-to-r from-blue-600 to-blue-500",
    imageColor: "bg-blue-500/20",
  },
  {
    title: "ETF 투자 이벤트",
    subtitle: "<뱅키스 이벤트>",
    description: "ETF 투자 시 다양한 혜택을 받아보세요!",
    period: "2025.02.15 ~ 2025.05.31",
    color: "bg-gradient-to-r from-sky-600 to-sky-500",
    imageColor: "bg-sky-500/20",
  },
  {
    title: "주식 이체 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "타사 주식 이체 시 수수료 지원 혜택!",
    period: "2025.01.10 ~ 2025.04.10",
    color: "bg-gradient-to-r from-blue-600 to-blue-500",
    imageColor: "bg-blue-500/20",
  },
];

// Banner data
const banners = [
  {
    title: "국내 선물옵션 수수료 할인 이벤트",
    description: "수수료 할인으로 더 큰 수익을 만들어보세요",
    period: "2025. 01. 02 ~ 2025. 06. 30",
    discount: "9.1%",
    color: "bg-gradient-to-r from-blue-600 to-blue-400",
    accent: "bg-blue-300",
  },
  {
    title: "해외 주식 거래 수수료 이벤트",
    description: "해외 주식 거래도 한국투자증권과 함께",
    period: "2025. 02. 01 ~ 2025. 05. 31",
    discount: "8.5%",
    color: "bg-gradient-to-r from-indigo-600 to-indigo-400",
    accent: "bg-indigo-300",
  },
  {
    title: "신규 계좌 개설 프로모션",
    description: "새로운 시작을 한국투자증권과 함께하세요",
    period: "2025. 01. 15 ~ 2025. 04. 15",
    discount: "10%",
    color: "bg-gradient-to-r from-sky-600 to-sky-400",
    accent: "bg-sky-300",
  },
];

// Winner announcements data
const winnerAnnouncements = [
  {
    id: 1312,
    title: "흑백대전 실전투자대회 (신규개설) 대상 이벤트 당첨자",
    date: "2025.03.07",
  },
  {
    id: 1311,
    title: "흑백대전 실전투자대회 (무거래고객) 대상 이벤트 당첨자",
    date: "2025.03.05",
  },
  {
    id: 1310,
    title: "FY25 1라운드 흑백대전 실전투자대회 총상채크 이벤트 당첨자",
    date: "2025.02.24",
  },
  {
    id: 1309,
    title: "뱅키스 KODEX 미국배당커버드콜액티브 ETF 거래이벤트 당첨자 안내",
    date: "2025.02.20",
  },
  {
    id: 1308,
    title: "뱅키스 KODEX 미국배당다우존스 ETF 거래이벤트 시즌2 당첨자 안내",
    date: "2025.02.20",
  },
  {
    id: 1307,
    title: "[BanKIS]해외주식 설특집 프로모션 당첨자 안내",
    date: "2025.02.17",
  },
  {
    id: 1306,
    title:
      "뱅키스 KODEX 미국S&P500대일리커버드콜OTM ETF 거래이벤트 당첨자 안내",
    date: "2025.02.11",
  },
  {
    id: 1305,
    title: "뱅키스 PLUS 한화그룹주 ETF 거래이벤트 당첨자 안내",
    date: "2025.02.05",
  },
  {
    id: 1304,
    title: "[BanKIS]국내선물옵션 수수료 할인 이벤트 시즌3(7~12월) 당첨자 안내",
    date: "2025.02.03",
  },
  {
    id: 1303,
    title: "뱅키스 KODEX 미국배당다우존스 ETF 거래이벤트 당첨자 안내",
    date: "2025.02.03",
  },
  {
    id: 1302,
    title: "뱅키스 KODEX 한국부동산리츠인프라 ETF 거래이벤트 당첨자 안내",
    date: "2025.02.03",
  },
  {
    id: 1301,
    title: "FY24 4라운드 흑백대전 실전투자대회 이벤트 당첨자 발표",
    date: "2025.01.31",
  },
  {
    id: 1300,
    title: "국내주식 활력투자 이벤트 당첨자 안내",
    date: "2025.01.29",
  },
  {
    id: 1299,
    title: "국내주식 이전 이벤트 당첨자 안내",
    date: "2025.01.29",
  },
  {
    id: 1298,
    title: "해외주식 IBKR 연결 이벤트 당첨자 안내",
    date: "2025.01.28",
  },
];

// Past events data
const pastEvents = [
  {
    id: 1,
    title: "KIWOOM 미국대표지수 2종 ETF 거래이벤트",
    description: "ETF 거래하고 문화상품권 3만원 혜택 받으세요~!",
    period: "2025.02.03 - 2025.02.28",
    image: "bg-gray-200",
    category: "ETF 이벤트",
  },
  {
    id: 2,
    title: "TIGER조선 TOP ETF 거래이벤트 시즌2",
    description: "ETF 거래하고 문화상품권 5만원 혜택 받으세요~!",
    period: "2025.02.03 - 2025.02.28",
    image: "bg-gray-200",
    category: "ETF 이벤트",
  },
  {
    id: 3,
    title: "<공업점 이벤트> 운용사 ETF 거래이벤트",
    description: "운용사 ETF 이벤트 참여시 최대 15만원 혜택!",
    period: "2024.12.20 - 2025.02.28",
    image: "bg-gray-200",
    category: "영업점 이벤트",
  },
  {
    id: 4,
    title: "OpenAPI 신규 고객 이벤트 시즌1(이벤트 조기종료_1/15)",
    description:
      "Open API 거래하고 최대 한달 100만원 + 신세계백화점상품권 혜택 받아가세요~!",
    period: "2025.01.02 - 2025.02.28",
    image: "bg-gray-200",
    category: "API 이벤트",
  },
  {
    id: 5,
    title: "해외주식 거래 이벤트",
    description: "해외주식 거래하고 수수료 할인 혜택 받으세요!",
    period: "2024.12.15 - 2025.01.31",
    image: "bg-gray-200",
    category: "해외주식 이벤트",
  },
  {
    id: 6,
    title: "국내주식 신규 거래 이벤트",
    description: "국내주식 거래하고 다양한 혜택을 받아보세요!",
    period: "2024.11.01 - 2025.01.15",
    image: "bg-gray-200",
    category: "국내주식 이벤트",
  },
  {
    id: 7,
    title: "연말 투자 이벤트",
    description: "연말 투자 상품 가입하고 특별 혜택 받으세요!",
    period: "2024.12.01 - 2024.12.31",
    image: "bg-gray-200",
    category: "투자 이벤트",
  },
  {
    id: 8,
    title: "뱅키스 ETF 거래 이벤트",
    description: "뱅키스에서 ETF 거래하고 경품 받아가세요!",
    period: "2024.11.15 - 2024.12.31",
    image: "bg-gray-200",
    category: "뱅키스 이벤트",
  },
];

export default function TradingCompetition() {
  const [activeTab, setActiveTab] = useState("current");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(4);
  const [winnersItemsPerPage, setWinnersItemsPerPage] = useState(10);
  const [pastItemsPerPage, setPastItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [, setPastCurrentPage] = useState(1);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  // Filter events based on the active filter
  const filteredEvents = events.filter((event) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "branch" && event.subtitle.includes("영업점"))
      return true;
    if (activeFilter === "bankis" && event.subtitle.includes("뱅키스"))
      return true;
    return false;
  });

  // Filter based on search term
  const searchFiltered = (items: EventItem[]) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get paginated data
  const getPaginatedData = (items: EventItem[]) => {
    const filtered = searchFiltered(items);
    // Use the appropriate itemsPerPage based on the active tab
    const itemsPerPage =
      activeTab === "current"
        ? currentItemsPerPage
        : activeTab === "winners"
        ? winnersItemsPerPage
        : pastItemsPerPage;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  // Get data for current tab
  const currentTabData = () => {
    switch (activeTab) {
      case "current":
        return getPaginatedData(filteredEvents);
      case "winners":
        return getPaginatedData(winnerAnnouncements);
      case "past":
        return getPaginatedData(pastEvents);
      default:
        return { data: [], totalPages: 0 };
    }
  };

  const { data, totalPages } = currentTabData();

  return (
    <div className="px-4 py-4 w-full max-w-7xl mx-auto bg-white">
      <div className="flex flex-col w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>
      {/* Tabs - Modern design with underline indicator */}
      <div className="mb-8 border-b border-gray-200">
        <div className="flex">
          <TabButton
            isActive={activeTab === "current"}
            onClick={() => {
              setActiveTab("current");
              setCurrentPage(1);
            }}
          >
            진행중인 이벤트
          </TabButton>
          <TabButton
            isActive={activeTab === "winners"}
            onClick={() => {
              setActiveTab("winners");
              setCurrentPage(1);
            }}
          >
            당첨자 발표
          </TabButton>
          <TabButton
            isActive={activeTab === "past"}
            onClick={() => {
              setActiveTab("past");
              setCurrentPage(1);
            }}
          >
            지난 이벤트
          </TabButton>
        </div>
      </div>

      {/* Content for current tab */}
      {activeTab === "current" && (
        <div className="space-y-4">
          {/* Carousel Banner - Modern design with gradient background */}
          <div className="relative">
            {/* Banner with enhanced design */}
            <div
              className={`${banners[activeSlide].color} rounded-2xl shadow-lg overflow-hidden`}
            >
              <div className="p-8 text-white relative">
                <div className="max-w-3xl">
                  <h2 className="text-2xl font-bold mb-2">
                    {banners[activeSlide].title}
                  </h2>
                  <p className="text-white/80 mb-4">
                    {banners[activeSlide].description}
                  </p>
                  <div className="text-sm font-light opacity-90">
                    {banners[activeSlide].period}
                  </div>
                </div>

                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner bg-white/10">
                    <div className="text-3xl font-bold text-white">
                      {banners[activeSlide].discount}
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-x-20 -translate-y-32 bg-white/5"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-x-12 translate-y-10 bg-white/5"></div>
              </div>
            </div>

            {/* Carousel Navigation - Moved further outside */}
            <button
              onClick={prevSlide}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md hover:shadow-lg rounded-full p-3 z-10 cursor-pointer transition-all duration-200"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md hover:shadow-lg rounded-full p-3 z-10 cursor-pointer transition-all duration-200"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>

            {/* Carousel Indicators - Modern dots */}
            <div className="flex justify-center gap-2 mt-4">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 transition-all rounded-full cursor-pointer ${
                    activeSlide === index
                      ? "w-8 bg-blue-500"
                      : "w-2 bg-gray-300"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Filter buttons - Modern pill design */}
          {/* <div className="flex flex-wrap gap-2 mt-4">
            <FilterButton
              isActive={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            >
              전체
            </FilterButton>
            <FilterButton
              isActive={activeFilter === "branch"}
              onClick={() => setActiveFilter("branch")}
            >
              영업점계좌
            </FilterButton>
            <FilterButton
              isActive={activeFilter === "bankis"}
              onClick={() => setActiveFilter("bankis")}
            >
              뱅키스계좌
            </FilterButton>
          </div> */}

          {/* Search and filter - Modern clean design */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
            <Select
              value={currentItemsPerPage.toString()}
              onValueChange={(value) => {
                setCurrentItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36 border rounded-lg shadow-sm cursor-pointer">
                <SelectValue placeholder={`${currentItemsPerPage}개씩 보기`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4" className="cursor-pointer">
                  4개씩 보기
                </SelectItem>
                <SelectItem value="10" className="cursor-pointer">
                  10개씩 보기
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20개씩 보기
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full sm:w-auto max-w-sm">
              <div className="relative flex-1">
                <Input
                  placeholder="검색어를 입력하세요."
                  className="pr-10 border rounded-lg shadow-sm pl-4"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg shadow-sm"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Event list - Modern card design */}
          <div className="mt-0 pt-2">
            <div className="grid gap-6">
              {data.length > 0 ? (
                data.map((event, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div
                        className={`w-full sm:w-40 h-32 sm:h-auto ${event.imageColor} flex-shrink-0 flex items-center justify-center`}
                      >
                        <div className="text-3xl font-bold text-gray-600/50">
                          {event.title.substring(0, 1)}
                        </div>
                      </div>
                      <div className="flex-1 p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="text-sm text-blue-600 mb-1 font-medium">
                              {event.subtitle}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </h3>
                          </div>
                          <Badge className="self-start sm:self-center bg-blue-500 hover:bg-blue-600 transition-colors">
                            진행중
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-3">
                          {event.description}
                        </p>
                        <div className="mt-4 pt-2 border-t border-dashed border-gray-100">
                          <p className="text-xs text-gray-500 flex items-center">
                            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                            기간: {event.period}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content for winners tab */}
      {activeTab === "winners" && (
        <div className="space-y-6">
          {/* Search and filter controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
            <Select
              value={winnersItemsPerPage.toString()}
              onValueChange={(value) => {
                setWinnersItemsPerPage(Number.parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36 border rounded-lg shadow-sm cursor-pointer">
                <SelectValue placeholder={`${winnersItemsPerPage}개씩 보기`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="cursor-pointer">
                  10개씩 보기
                </SelectItem>
                <SelectItem value="15" className="cursor-pointer">
                  15개씩 보기
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20개씩 보기
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full sm:w-auto max-w-sm">
              <div className="relative flex-1">
                <Input
                  placeholder="검색어를 입력하세요."
                  className="pr-10 border rounded-lg shadow-sm pl-4"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg shadow-sm"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Winners announcement table - Modern design */}
          <div className="mt-4 overflow-hidden rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left w-20 font-medium text-gray-600 text-sm border-b">
                    NO
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600 text-sm border-b">
                    제목
                  </th>
                  <th className="py-3 px-4 text-left w-28 font-medium text-gray-600 text-sm border-b">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((announcement) => (
                    <tr
                      key={announcement.id}
                      className="border-b border-gray-50 hover:bg-blue-50/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-4 text-gray-600">
                        {announcement.id}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {announcement.title}
                      </td>
                      <td className="py-4 px-4 text-gray-500 text-sm">
                        {announcement.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-gray-400">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for past events tab */}
      {activeTab === "past" && (
        <div className="space-y-6">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4">
            <Select
              value={pastItemsPerPage.toString()}
              onValueChange={(value) => {
                setPastItemsPerPage(Number.parseInt(value));
                setPastCurrentPage(1);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36 border rounded-lg shadow-sm cursor-pointer">
                <SelectValue placeholder={`${pastItemsPerPage}개씩 보기`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10" className="cursor-pointer">
                  10개씩 보기
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20개씩 보기
                </SelectItem>
                <SelectItem value="30" className="cursor-pointer">
                  30개씩 보기
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full sm:w-auto max-w-sm">
              <div className="relative flex-1">
                <Input
                  placeholder="검색어를 입력하세요."
                  className="pr-10 border rounded-lg shadow-sm pl-4"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-lg shadow-sm"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Past events list - Modern card design */}
          <div className="mt-4 grid gap-4">
            {data.length > 0 ? (
              data.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-20 h-20 ${event.image} rounded-lg flex-shrink-0 flex items-center justify-center`}
                    >
                      <span className="text-gray-400 text-xl font-medium">
                        {event.title.substring(0, 1)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-1">
                            {event.category}
                          </div>
                          <h3 className="font-medium text-gray-900">
                            {event.title}
                          </h3>
                        </div>
                        <Badge
                          variant="outline"
                          className="self-start sm:self-center border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          종료
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span>
                        기간: {event.period}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-lg">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination - Modern clean design */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.max(prev - 1, 1));
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Calculate which page numbers to show
                let pageNum;
                if (totalPages <= 5) {
                  // If 5 or fewer pages, show all pages
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  // If on pages 1-3, show pages 1-5
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  // If on last 3 pages, show last 5 pages
                  pageNum = totalPages - 4 + i;
                } else {
                  // Otherwise show current page and 2 pages on either side
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

// Tab button - Modern design with animated underline
function TabButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-4 text-center transition-all relative cursor-pointer"
    >
      <span
        className={`relative ${
          isActive
            ? "text-blue-600 font-medium"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {children}
      </span>
      {isActive && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
      )}
    </button>
  );
}

// Filter button - Modern pill design
function FilterButton({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        isActive
          ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
      }`}
    >
      {children}
    </button>
  );
}
