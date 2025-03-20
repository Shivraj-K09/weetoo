"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Exchange {
  id: number;
  name: string;
  paybackRate: string;
  paybackColor: string;
  tradingFee: string;
  withdrawalFee: string;
  promotion: string;
  description?: string;
  features?: string[];
}

export function CryptoExchangeTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const rowsPerPage = 10;

  const exchanges: Exchange[] = [
    {
      id: 1,
      name: "Binance",
      paybackRate: "35%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "바이낸스는 세계 최대 규모의 암호화폐 거래소로, 다양한 암호화폐와 거래 옵션을 제공합니다.",
      features: [
        "전체 비트코인 거래량 순위 6위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 2,
      name: "Bitget",
      paybackRate: "55%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "비트겟은 사용자 친화적인 인터페이스와 다양한 거래 옵션을 제공하는 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 8위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 3,
      name: "OKX",
      paybackRate: "55%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "OKX는 다양한 암호화폐 거래 옵션과 파생상품을 제공하는 글로벌 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 5위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 4,
      name: "Bybit",
      paybackRate: "40%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "바이비트는 파생상품 거래에 특화된 암호화폐 거래소로, 레버리지 거래를 지원합니다.",
      features: [
        "전체 비트코인 거래량 순위 7위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 5,
      name: "XT.com",
      paybackRate: "70%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "XT(XT.COM) 거래소는 글로벌 암호화폐 거래소로서 다양한 암호화폐와 거래 서비스를 제공하고 있습니다. 우리는 안전하고 신뢰할 수 있는 암호화폐 거래플랫폼, 투명하고 효율적 주문 처리, 초저지연 매칭 엔진 거래체험을 위해, 하드, 네트워크 기술적 스펙아웃, 제품, 개발 등 다양한 서비스를 제공합니다.",
      features: [
        "전체 비트코인 거래량 순위 6위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 6,
      name: "BingX",
      paybackRate: "65%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "BingX는 소셜 트레이딩 기능을 제공하는 혁신적인 암호화폐 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 9위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 7,
      name: "DeepCoin",
      paybackRate: "70%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "DeepCoin은 안전하고 신뢰할 수 있는 암호화폐 거래 플랫폼을 제공합니다.",
      features: [
        "전체 비트코인 거래량 순위 12위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 8,
      name: "Tapbit",
      paybackRate: "70%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "Tapbit은 사용자 친화적인 인터페이스와 다양한 거래 옵션을 제공합니다.",
      features: [
        "전체 비트코인 거래량 순위 15위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 9,
      name: "HotCoin",
      paybackRate: "80%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "HotCoin은 다양한 암호화폐와 거래 옵션을 제공하는 글로벌 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 18위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 10,
      name: "CoinEx",
      paybackRate: "60%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "CoinEx는 다양한 암호화폐와 거래 옵션을 제공하는 글로벌 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 10위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 11,
      name: "Gate.io",
      paybackRate: "45%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "Gate.io는 다양한 암호화폐와 거래 옵션을 제공하는 글로벌 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 4위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
    {
      id: 12,
      name: "Huobi",
      paybackRate: "50%",
      paybackColor: "text-red-500",
      tradingFee: "0.024%",
      withdrawalFee: "0.045%",
      promotion: "입금 20% 크레딧",
      description:
        "Huobi는 다양한 암호화폐와 거래 옵션을 제공하는 글로벌 거래소입니다.",
      features: [
        "전체 비트코인 거래량 순위 3위 대형 거래소",
        "안정적인 레버리지 관리 보장제도",
        "한국 금융 서비스에 등록 거래소",
      ],
    },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(exchanges.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentExchanges = exchanges.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Generate a consistent color based on exchange name
  const getExchangeColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-lime-500",
    ];

    // Use the sum of character codes to determine color index
    const charSum = name
      .split("")
      .reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return colors[charSum % colors.length];
  };

  // Toggle expanded row
  const toggleRow = (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full mb-5">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[200px] font-medium text-gray-500">
                거래소
              </TableHead>
              <TableHead className="font-medium text-center text-red-500">
                페이백%
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                거래 할인%
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                지정가%
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                시장가%
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                이벤트
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExchanges.map((exchange) => (
              <React.Fragment key={exchange.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer transition-colors duration-200 group",
                    expandedRow === exchange.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => toggleRow(exchange.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${getExchangeColor(
                          exchange.name
                        )} text-white font-bold`}
                      >
                        {exchange.name.charAt(0)}
                      </div>
                      <span className="font-medium">{exchange.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={exchange.paybackColor}>
                      {exchange.paybackRate} 페이백
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-gray-500">-</TableCell>
                  <TableCell className="text-center text-gray-700">
                    {exchange.tradingFee}
                  </TableCell>
                  <TableCell className="text-center text-gray-700">
                    {exchange.withdrawalFee}
                  </TableCell>
                  <TableCell className="text-center relative">
                    <div className="flex items-center justify-center">
                      <Badge
                        variant="outline"
                        className="text-red-500 border-red-500 rounded-full"
                      >
                        {exchange.promotion}
                      </Badge>
                      <div className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                        {expandedRow === exchange.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRow === exchange.id && (
                  <TableRow className="bg-white border-t border-b border-gray-100">
                    <TableCell colSpan={6} className="p-0">
                      <div className="animate-in fade-in-0 zoom-in-95 duration-200 max-w-full">
                        <div className="p-6 overflow-hidden bg-white">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                                {exchange.name} 거래소
                              </h3>
                              <p className="text-gray-600 mb-5 leading-relaxed break-words whitespace-normal max-w-3xl">
                                {exchange.description}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                {exchange.features?.map((feature, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="mt-0.5 bg-blue-100 rounded-full p-1 flex-shrink-0">
                                      <Check className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <span className="text-sm text-gray-700">
                                      {feature}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="md:w-64 flex-shrink-0 flex flex-col justify-center space-y-4 md:border-l md:border-gray-100 md:pl-8">
                              <div className="text-center mb-2">
                                <span className="inline-block bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium">
                                  지금 바로 시작하세요
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                className="bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors w-full rounded-full"
                              >
                                간편 UID 등록
                              </Button>
                              <Button className="bg-red-500 hover:bg-red-600 transition-colors w-full rounded-full flex items-center justify-center gap-1">
                                가입하기
                                <ExternalLink className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={`page-${page}`}>
                <PaginationLink
                  isActive={page === currentPage}
                  onClick={() => setCurrentPage(Number(page))}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
  );
}
