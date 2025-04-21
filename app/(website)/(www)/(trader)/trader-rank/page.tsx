"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";

export default function KoreanDataTable() {
  // Sample data based on the screenshot
  const data = [
    {
      id: 1,
      nickname: "(avarta)test1",
      totalProfit: "+1,234,567 %",
      todayProfit: "+325%",
      tradeCount: "1234회",
      tradingRoom: "참가",
    },
    {
      id: 2,
      nickname: "test2",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 3,
      nickname: "test3",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 4,
      nickname: "test4",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 5,
      nickname: "test5",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 6,
      nickname: "test6",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 7,
      nickname: "test7",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 8,
      nickname: "",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 9,
      nickname: "test9",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 10,
      nickname: "test10",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 11,
      nickname: "test11",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 12,
      nickname: "test12",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 13,
      nickname: "test13",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 14,
      nickname: "test14",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 15,
      nickname: "test15",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 16,
      nickname: "test16",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 17,
      nickname: "test17",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 18,
      nickname: "test18",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 19,
      nickname: "test19",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
    {
      id: 20,
      nickname: "test20",
      totalProfit: "",
      todayProfit: "",
      tradeCount: "",
      tradingRoom: "",
    },
  ];

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Calculate pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number.parseInt(value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];

    // For small number of pages, show all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      return items;
    }

    // For larger number of pages, show with ellipsis
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Add ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add pages around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add last page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto">
        <div className="flex gap-5 items-center w-full justify-center">
          <Image
            src="/banner2.png"
            alt="trader-banner"
            width={1000}
            height={250}
            className="w-full rounded"
          />
        </div>
        <table className="w-full border mt-5">
          <thead>
            <tr className="text-center border-b">
              <th className="px-4 py-3 font-medium text-gray-700">순위</th>
              <th className="px-4 py-3 font-medium text-gray-700">닉네임</th>
              <th className="px-4 py-3 font-medium text-gray-700">총 수익률</th>
              <th className="px-4 py-3 font-medium text-gray-700">
                오늘 수익률
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                총 매매 횟수
              </th>
              <th className="px-4 py-3 font-medium text-gray-700">
                트레이딩룸
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}
              >
                <td className="px-4 py-3 text-center text-gray-500">
                  {row.id}
                </td>
                <td className="px-4 py-3 text-center text-gray-500">
                  {row.nickname}
                </td>
                <td className="px-4 py-3 text-center text-red-500">
                  {row.totalProfit}
                </td>
                <td className="px-4 py-3 text-center text-red-500">
                  {row.todayProfit}
                </td>
                <td className="px-4 py-3 text-center text-green-500">
                  {row.tradeCount}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">
                  {row.tradingRoom}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t">
        <div className="flex items-center whitespace-nowrap">
          <span className="text-sm text-gray-700 mr-2">Rows per page:</span>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={handleRowsPerPageChange}
          >
            <SelectTrigger className="w-24 h-8 cursor-pointer">
              <SelectValue placeholder={rowsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent className="min-w-[96px]">
              <SelectItem value="10" className="cursor-pointer">
                10
              </SelectItem>
              <SelectItem value="20" className="cursor-pointer">
                20
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                aria-disabled={currentPage === totalPages}
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
    </div>
  );
}
