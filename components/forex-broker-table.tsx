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
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Broker {
  id: number;
  name: string;
  platforms: string;
  accountTypes: string;
  minDeposit: string;
  spread: string;
  promotion: string;
  promotionColor: string;
  description?: string;
  features?: string[];
}

export function ForexBrokerTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const rowsPerPage = 10;

  const brokers: Broker[] = [
    {
      id: 1,
      name: "AVATRADE",
      platforms: "MT4  MT5\nAVA SOCIAL\n유튜버페이아웃",
      accountTypes: "STANDARD\nVIP\nECN",
      minDeposit: "$30",
      spread: "0.3",
      promotion: "가입환영 $50\n$3 페이백",
      promotionColor: "text-red-500",
      description:
        "아바트레이드는 영국 금융감독원(FCA) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다.",
      features: [
        "AVA SOCIAL 커뮤니티 트레이딩 지원",
        "최저 트레이딩 비용과 투명한 실행 제공하며 제로",
        "MYT Alpine FX 등의 Alpine Endurance 브랜드 제휴되어",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
    {
      id: 2,
      name: "INFINOX",
      platforms: "MT4  MT5\nIX SOCIAL",
      accountTypes: "STP\nECN",
      minDeposit: "$30",
      spread: "0",
      promotion: "입금 20% 크레딧\n$3 페이백",
      promotionColor: "text-red-500",
      description:
        "인피녹스는 영국 금융감독원(FCA) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다. 인피녹스는 영국, 지오시티스, 홍콩, 바하마 주식, 바레인과 등 전세계 다양한곳에서 총 375개 종목의 상품 거래를 중개합니다. 인피녹스는 고객 자금이 최대 영국 금융서비스보상제도에 의해 각각 최대 20,000 파운드까지 보호되고 있습니다.",
      features: [
        "IX SOCIAL 커뮤니티 트레이딩 및 경쟁",
        "최저 트레이딩 비용과 투명한 실행 제공하며 제로",
        "MYT Alpine FX 등의 Alpine Endurance 브랜드 제휴되어",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
    {
      id: 3,
      name: "GO MARKET",
      platforms: "MT4  MT5\nGENISIUS",
      accountTypes: "GO PLUS\nSTANDARD\nMICRO",
      minDeposit: "$30",
      spread: "0",
      promotion: "입금 20% 크레딧",
      promotionColor: "text-red-500",
      description:
        "고마켓은 호주 금융감독원(ASIC) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다.",
      features: [
        "GENISIUS 커뮤니티 트레이딩 및 경쟁",
        "최저 트레이딩 비용과 투명한 실행 제공하며 제로",
        "다양한 계좌 유형 제공 (GO PLUS, STANDARD, MICRO)",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
    {
      id: 4,
      name: "XM",
      platforms: "MT4  MT5",
      accountTypes: "MICRO\nSTANDARD\nULTRAROW",
      minDeposit: "$30",
      spread: "0.6",
      promotion: "입금 20% 크레딧",
      promotionColor: "text-red-500",
      description:
        "XM은 키프로스 증권거래위원회(CySEC) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다.",
      features: [
        "다양한 계좌 유형 제공 (MICRO, STANDARD, ULTRAROW)",
        "최저 트레이딩 비용과 투명한 실행 제공",
        "다양한 보너스 및 프로모션 제공",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
    {
      id: 5,
      name: "LAND FX",
      platforms: "MT4  MT5",
      accountTypes: "-",
      minDeposit: "$30",
      spread: "0",
      promotion: "입금 20% 크레딧",
      promotionColor: "text-red-500",
      description:
        "랜드FX는 바누아투 금융감독원(VFSC) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다.",
      features: [
        "최저 트레이딩 비용과 투명한 실행 제공",
        "다양한 보너스 및 프로모션 제공",
        "MT4 및 MT5 플랫폼 지원",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
    {
      id: 6,
      name: "AP MARKET",
      platforms: "MT4  MT5",
      accountTypes: "-",
      minDeposit: "$30",
      spread: "0",
      promotion: "입금 20% 크레딧",
      promotionColor: "text-red-500",
      description:
        "AP마켓은 세인트빈센트 그레나딘 금융감독원(SVG) 규제 아래 운영되는 FX&CFD 트레이딩 플랫폼으로 전세계적으로 인정받는 브로커입니다.",
      features: [
        "최저 트레이딩 비용과 투명한 실행 제공",
        "다양한 보너스 및 프로모션 제공",
        "MT4 및 MT5 플랫폼 지원",
        "세계 유명 플랫폼 저수 제공과 보호된 (레버리지 포함)",
      ],
    },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(brokers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentBrokers = brokers.slice(startIndex, endIndex);

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

  // Generate a consistent color based on broker name
  const getBrokerColor = (name: string) => {
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
            <TableRow className="bg-white border-b">
              <TableHead className="w-[180px] font-medium text-center text-red-500">
                플랫폼
              </TableHead>
              <TableHead className="w-[180px] font-medium text-center text-gray-500">
                계좌유형
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                최소 증거금
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                최소 스프레드
              </TableHead>
              <TableHead className="font-medium text-center text-gray-500">
                이벤트
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentBrokers.map((broker) => (
              <React.Fragment key={broker.id}>
                <TableRow
                  className={cn(
                    "cursor-pointer transition-colors duration-200 group",
                    expandedRow === broker.id
                      ? "bg-blue-50"
                      : "hover:bg-gray-50"
                  )}
                  onClick={() => toggleRow(broker.id)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${getBrokerColor(
                          broker.name
                        )} text-white font-bold`}
                      >
                        {broker.name.charAt(0)}
                      </div>
                      <div className="font-bold text-gray-900">
                        {broker.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="whitespace-pre-line text-sm">
                      {broker.platforms}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="whitespace-pre-line text-sm">
                      {broker.accountTypes}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {broker.minDeposit}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {broker.spread}
                  </TableCell>
                  <TableCell className="text-center relative">
                    <div className="flex items-center justify-center">
                      <div
                        className={cn(
                          "whitespace-pre-line text-sm",
                          broker.promotionColor
                        )}
                      >
                        {broker.promotion}
                      </div>
                      <div className="ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
                        {expandedRow === broker.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRow === broker.id && (
                  <TableRow className="bg-white border-t border-b border-gray-100">
                    <TableCell colSpan={6} className="p-0">
                      <div className="animate-in fade-in-0 zoom-in-95 duration-200 max-w-full">
                        <div className="p-6 overflow-hidden bg-white">
                          <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                              <p className="text-gray-600 mb-5 leading-relaxed break-words whitespace-normal max-w-3xl text-sm">
                                {broker.description}
                              </p>
                              <div className="grid grid-cols-1 gap-3 mb-4">
                                {broker.features?.map((feature, index) => (
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
                            <div className="md:w-48 flex-shrink-0 flex flex-col justify-center space-y-4">
                              <Button className="bg-red-500 hover:bg-red-600 transition-colors w-full rounded-md">
                                가입하기
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-white text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors w-full rounded-md"
                              >
                                간편 계좌 등록
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

      {totalPages > 1 && (
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
      )}
    </div>
  );
}
