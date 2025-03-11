"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("10000");

  return (
    <div className="hidden lg:flex py-2 items-center">
      <div className="max-w-[80rem] mx-auto flex w-full justify-between">
        <Link href="/">
          <Image src="/logo1.png" width={100} height={25} alt="logo" />
        </Link>
        <div className="flex gap-10">
          <Link
            href="/purchase"
            className="flex items-center font-semibold text-sm gap-2"
          ></Link>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="cursor-pointer">
              <Button variant="ghost">
                <Image
                  src="/coins.png"
                  width={25}
                  height={25}
                  alt="stack of coins"
                />
                코코인 충전
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-[380px] rounded-none"
              align="start"
            >
              <div className="overflow-hidden rounded-none">
                {/* Header */}
                <div className="bg-[#434753] py-3 px-4 flex justify-between items-center">
                  <h3 className="text-white font-medium">코코인 충전하기</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 cursor-pointer w-6 text-white hover:bg-[#5a5f6b]"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="">
                  {/* Direct input */}
                  <div className="flex justify-center items-center mb-4 p-5 pb-0">
                    <span className="font-medium mr-2">직접 입력</span>
                    <Input
                      className="w-[240px] border-gray-300 shadow-none rounded-none"
                      placeholder="금액 입력"
                    />
                  </div>

                  {/* Coin amount options */}
                  <div className="grid grid-cols-3 gap-4 p-5 pb-6 pt-3">
                    {[
                      10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000,
                      90000,
                    ].map((amount) => (
                      <div key={amount} className="flex items-center gap-2">
                        <Checkbox
                          id={`amount-${amount}`}
                          checked={selectedAmount === amount.toString()}
                          onCheckedChange={() =>
                            setSelectedAmount(amount.toString())
                          }
                          className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 rounded-full"
                        />
                        <Label
                          htmlFor={`amount-${amount}`}
                          className="text-[0.825rem]"
                        >
                          {amount.toLocaleString()} 캐시
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Gray background section */}
                  <div className="bg-gray-100 p-4 space-y-4">
                    {/* Bonus info */}
                    <div className="text-center text-sm">
                      <p className="text-gray-600">
                        입금금액은 부가세
                        <span className="text-red-500">10%</span> 포함{" "}
                        <span className="text-red-500 font-bold">11,000</span>{" "}
                        원이며,
                      </p>
                      <p className="text-gray-600">
                        충전될 캐시는{" "}
                        <span className="text-red-500 font-bold">10,000</span>{" "}
                        입니다.
                      </p>
                    </div>

                    {/* Bank account info */}
                    <div className="text-center text-sm">
                      <p className="text-gray-600">
                        하나은행 880-910101-42505 주식회사 코넷
                      </p>
                    </div>

                    {/* Payment inputs */}
                    <div className="space-y-3">
                      <Input
                        className="w-full border-gray-300 bg-white shadow-none rounded-none h-10"
                        placeholder="(필수입력) 입금자 이름을 입력"
                      />
                      <Input
                        className="w-full border-gray-300 bg-white shadow-none rounded-none h-10"
                        placeholder="(선택사항) 입금 정보를 받아볼 휴대전화 번호를 입력"
                      />
                    </div>
                  </div>

                  {/* Notice and button */}
                  <div className="mt-4 p-5">
                    {/* Notice */}
                    <div className="text-center mb-2">
                      <p className="text-red-400 text-sm">
                        이이름 및 캐시 입력 소진 시 환불 불가
                      </p>
                    </div>

                    {/* Submit button */}
                    <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-5 mt-3 rounded-none">
                      캐시 충전하기
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href="/customer-support"
            className="flex items-center text-sm font-semibold gap-2"
          >
            <Image src="/computer.png" width={25} height={25} alt="computer" />
            고객센터
          </Link>
        </div>
      </div>
    </div>
  );
}
