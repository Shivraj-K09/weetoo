"use client";

import { useState } from "react";
import { Award, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUserStore } from "@/lib/store/user-store";
import { formatNumber } from "@/utils/format-utils";
import { pointsData } from "./profile-data";

export function PointsTab() {
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { profile } = useUserStore();

  return (
    <div className="p-0">
      {/* Points Header */}
      <div className="bg-[#E63946] text-white p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8" />
            <h2 className="text-xl font-bold">보유 코코인</h2>
          </div>
          <div className="flex flex-col items-end mt-4 md:mt-0">
            <div className="text-3xl font-bold">
              {formatNumber(profile?.kor_coins || 0)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                onClick={() => setWithdrawDialogOpen(true)}
              >
                출금하기
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Points */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-[#E63946] text-white">빌드 코코인</Badge>
          <span className="text-xl font-bold">
            {formatNumber(pointsData.availablePoints)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            1일
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            3일
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            1주
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            1개월
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            3개월
          </Badge>
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 cursor-pointer"
          >
            전체
          </Badge>
        </div>
      </div>

      {/* Points Transactions */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8F9FA] border-b border-gray-200">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500">
                코코인
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500">
                소식사항
              </th>
              <th className="p-3 text-right text-xs font-medium text-gray-500">
                일시
              </th>
            </tr>
          </thead>
          <tbody>
            {pointsData.transactions.map((transaction: any) => (
              <motion.tr
                key={transaction.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{
                  backgroundColor: "rgba(243, 244, 246, 0.7)",
                }}
              >
                <td className="p-3">
                  <div
                    className={cn(
                      "font-medium",
                      transaction.amount > 0 ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {formatNumber(transaction.amount)}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "mr-2",
                        transaction.amount > 0
                          ? "bg-green-50 text-green-600 border-green-100"
                          : "bg-red-50 text-red-600 border-red-100"
                      )}
                    >
                      {transaction.type}
                    </Badge>
                    <span className="text-sm text-gray-700">
                      {transaction.description}
                    </span>
                  </div>
                </td>
                <td className="p-3 text-right text-xs text-gray-500">
                  {transaction.date}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-200 flex justify-center">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 p-0 border-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-8 px-3 border-gray-200 bg-[#E63946] text-white hover:bg-[#D62C39] hover:text-white"
          >
            1
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 min-w-8 px-3 border-gray-200"
          >
            2
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 p-0 border-gray-200"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">코코인 출금하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">출금 가능 금액</span>
              <span className="font-bold text-lg">
                {formatNumber(pointsData.availablePoints)}
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                출금 금액
              </label>
              <Input
                id="amount"
                placeholder="금액 입력"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="focus-visible:ring-[#E63946]"
              />
            </div>

            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
              <div className="text-sm font-medium mb-2">출금 안내</div>
              <div className="text-xs text-gray-600 space-y-2">
                <p>( 설명 ) 회원가입시 본인 인증된 본인의 실명</p>
                <p>( 개정번호 ) 회원가입시 본인 인증된 본인의 계좌</p>
                <p>( 은행 ) 회원가입시 본인 인증된 본인의 계좌 은행</p>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              회원가입시 본인인증된 연락처 계좌정보만 출금이 가능합니다.
              <br />
              타인의 연락처 사용시 추후 계좌이체 처리에 문제를 일으킵니다.
            </div>

            <div className="text-xs text-gray-500">
              계좌정보 오기입으로 인한 출금처리는 본인에게 책임이 있습니다.
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-full bg-[#E63946] hover:bg-[#D62C39]"
              onClick={() => setWithdrawDialogOpen(false)}
            >
              코코인 출금신청
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
