"use client";

import type React from "react";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Event data
const events = [
  {
    title: "절세상품 이벤트 MOVE UP!",
    subtitle: "<영업점 이벤트>",
    description: "한투에서 개인연금, ISA 가입 시 최대 116만원 혜택!",
    period: "2025.01.02 ~ 2025.03.31",
  },
  {
    title: "주식재권 이벤트 MOVE UP!",
    subtitle: "<영업점 이벤트>",
    description: "주식, 재권 한투로 이전 시 최대 160만원 혜택!",
    period: "2025.01.02 ~ 2025.03.31",
  },
  {
    title: "세금 줄이고 ETF도 받자!!",
    subtitle: "<뱅키스 이벤트>",
    description: "ISA중개형 계좌로 바꾸고 - 세금 줄이고 ETF도 받자~!!",
    period: "2025.01.01 ~ 2025.03.31",
  },
  {
    title: "신규 계좌 개설 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "신규 계좌 개설 시 다양한 혜택을 받아보세요!",
    period: "2025.02.01 ~ 2025.04.30",
  },
  {
    title: "해외 주식 거래 수수료 이벤트",
    subtitle: "<뱅키스 이벤트>",
    description: "해외 주식 거래 시 수수료 할인 혜택!",
    period: "2025.01.15 ~ 2025.05.15",
  },
  {
    title: "연금저축 추가 적립 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "연금저축 추가 적립 시 특별 혜택을 드립니다!",
    period: "2025.03.01 ~ 2025.06.30",
  },
  {
    title: "ETF 투자 이벤트",
    subtitle: "<뱅키스 이벤트>",
    description: "ETF 투자 시 다양한 혜택을 받아보세요!",
    period: "2025.02.15 ~ 2025.05.31",
  },
  {
    title: "주식 이체 이벤트",
    subtitle: "<영업점 이벤트>",
    description: "타사 주식 이체 시 수수료 지원 혜택!",
    period: "2025.01.10 ~ 2025.04.10",
  },
];

// Banner data
const banners = [
  {
    title: "국내 선물옵션 수수료 할인 이벤트",
    period: "2025. 01. 02 ~ 2025. 06. 30",
    discount: "9.1%",
  },
  {
    title: "해외 주식 거래 수수료 이벤트",
    period: "2025. 02. 01 ~ 2025. 05. 31",
    discount: "8.5%",
  },
  {
    title: "신규 계좌 개설 프로모션",
    period: "2025. 01. 15 ~ 2025. 04. 15",
    discount: "10%",
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
  {
    id: 1297,
    title: "중국주식 신규거래 이벤트 당첨자 안내",
    date: "2025.01.26",
  },
  {
    id: 1296,
    title: "ETF 적립식 거래 이벤트 당첨자 발표",
    date: "2025.01.26",
  },
  {
    id: 1295,
    title: "뱅키스 미국증시 상향여행 이벤트 당첨자 발표",
    date: "2025.01.25",
  },
  {
    id: 1294,
    title: "뱅키스 거래수수료 할인 프로모션 당첨자 안내",
    date: "2025.01.25",
  },
  {
    id: 1293,
    title: "해외주식 연말정산 이벤트 당첨자 안내",
    date: "2025.01.24",
  },
  {
    id: 1292,
    title: "FY24 3라운드 흑백대전 실전투자대회 이벤트 당첨자 발표",
    date: "2025.01.22",
  },
  {
    id: 1291,
    title: "뱅키스 ETF 종합 패키지 이벤트 당첨자 안내",
    date: "2025.01.20",
  },
  {
    id: 1290,
    title: "뱅키스 KODEX ESG 멀티팩터 ETF 거래이벤트 당첨자 안내",
    date: "2025.01.18",
  },
  {
    id: 1289,
    title: "새해맞이 투자이벤트 당첨자 안내",
    date: "2025.01.15",
  },
  {
    id: 1288,
    title: "뱅키스 가상자산 ETF 이벤트 당첨자 안내",
    date: "2025.01.14",
  },
  {
    id: 1287,
    title: "뱅키스 국내주식 활성화 이벤트 당첨자 발표",
    date: "2025.01.12",
  },
  {
    id: 1286,
    title: "FY24 2라운드 흑백대전 실전투자대회 이벤트 당첨자 발표",
    date: "2025.01.10",
  },
  {
    id: 1285,
    title: "뱅키스 해외수수료 프로모션 당첨자 안내",
    date: "2025.01.05",
  },
  {
    id: 1284,
    title: "연말 투자상품 할인 이벤트 당첨자 안내",
    date: "2025.01.03",
  },
  {
    id: 1283,
    title: "FY24 1라운드 흑백대전 실전투자대회 이벤트 당첨자 발표",
    date: "2024.12.28",
  },
];

export default function TradingCompetition() {
  const [activeTab, setActiveTab] = useState("current");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

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

  // Calculate total pages
  const totalPages = Math.ceil(winnerAnnouncements.length / itemsPerPage);

  // Get paginated data
  const getPaginatedData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return winnerAnnouncements.slice(startIndex, endIndex);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col mb-5 w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>
      {/* Tabs */}
      <div className="border-b border-blue-500 mb-6">
        <div className="grid grid-cols-3 w-full">
          <TabButton
            isActive={activeTab === "current"}
            onClick={() => setActiveTab("current")}
          >
            진행중인 이벤트
          </TabButton>
          <TabButton
            isActive={activeTab === "winners"}
            onClick={() => setActiveTab("winners")}
          >
            당첨자 발표
          </TabButton>
          <TabButton
            isActive={activeTab === "past"}
            onClick={() => setActiveTab("past")}
          >
            지난 이벤트
          </TabButton>
        </div>
      </div>

      {/* Content for current tab */}
      {activeTab === "current" && (
        <div className="space-y-6">
          {/* Carousel Banner */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-md hover:bg-gray-100 rounded-full p-2 z-10 cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-blue-500" />
            </button>

            {/* Banner */}
            <div className="bg-blue-500 rounded-md text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {banners[activeSlide].title}
                </h2>
                <p>{banners[activeSlide].period}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-28 h-24 bg-blue-400 rounded flex items-center justify-center">
                  <div className="text-2xl font-bold text-white">
                    {banners[activeSlide].discount}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-white shadow-md hover:bg-gray-100 rounded-full p-2 z-10 cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-blue-500" />
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center gap-2 mt-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2 transition-all rounded-full cursor-pointer ${
                  activeSlide === index ? "w-8 bg-blue-500" : "w-2 bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 mt-4">
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
          </div>

          {/* Search and filter */}
          <div className="flex justify-between items-center mt-6 gap-4">
            <Select defaultValue="10">
              <SelectTrigger className="w-36 border rounded shadow-none cursor-pointer">
                <SelectValue placeholder="10개씩 보기" />
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

            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-28 border rounded shadow-none cursor-pointer">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    전체
                  </SelectItem>
                  <SelectItem value="title" className="cursor-pointer">
                    제목
                  </SelectItem>
                  <SelectItem value="content" className="cursor-pointer">
                    내용
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  placeholder="검색어를 입력하세요."
                  className="w-64 pr-10 border rounded shadow-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0  h-8.5"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Event list */}
          <div className="mt-6 border-t pt-6 h-[35rem] overflow-y-auto pr-2">
            <div className="space-y-6">
              {filteredEvents.map((event, index) => (
                <div key={index} className="flex border-b pb-6">
                  <div className="w-40 h-32 bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                    <div className="text-sm">{event.title.substring(0, 1)}</div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">
                          {event.subtitle}
                        </div>
                        <h3 className="font-bold">{event.title}</h3>
                      </div>
                      <div>
                        <Badge className="bg-blue-500 hover:bg-blue-500">
                          진행중
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm mt-2">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-4">
                      기간 : {event.period}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Placeholder content for other tabs */}
      {activeTab === "winners" && (
        <div className="space-y-6">
          {/* Search and filter */}
          <div className="flex justify-between items-center gap-4">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            >
              <SelectTrigger className="w-36 border rounded shadow-none cursor-pointer">
                <SelectValue placeholder={`${itemsPerPage}개씩 보기`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15" className="cursor-pointer">
                  15개씩 보기
                </SelectItem>
                <SelectItem value="30" className="cursor-pointer">
                  30개씩 보기
                </SelectItem>
                <SelectItem value="50" className="cursor-pointer">
                  50개씩 보기
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-28 border rounded shadow-none cursor-pointer">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    전체
                  </SelectItem>
                  <SelectItem value="title" className="cursor-pointer">
                    제목
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  placeholder="검색어를 입력하세요."
                  className="w-64 pr-10 border rounded shadow-none"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-0 top-0 h-full"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Winners announcement table */}
          <div className="mt-6 border-t border-b">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="py-3 px-4 text-left w-20 font-medium text-gray-600">
                    NO
                  </th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">
                    제목
                  </th>
                  <th className="py-3 px-4 text-left w-28 font-medium text-gray-600">
                    작성일
                  </th>
                </tr>
              </thead>
              <tbody>
                {getPaginatedData().map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="py-4 px-4 text-gray-700">
                      {announcement.id}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {announcement.title}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {announcement.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination className="mt-6">
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

      {activeTab === "past" && (
        <div className="h-40 flex items-center justify-center text-gray-500">
          지난 이벤트 내용이 여기에 표시됩니다.
        </div>
      )}
    </div>
  );
}

// Tab button with rounded corners and subtle hover effects
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
      className={`w-full py-3 text-center transition-colors cursor-pointer ${
        isActive
          ? "bg-blue-500 text-white rounded-t-md"
          : "text-gray-700 hover:bg-blue-100 hover:text-blue-600 hover:rounded-t-md"
      }`}
    >
      {children}
    </button>
  );
}

// Simple filter button that matches the original design
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
      className={`px-4 py-2 text-sm rounded-full cursor-pointer ${
        isActive
          ? "bg-blue-500 text-white"
          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
