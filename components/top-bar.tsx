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
import { MinusIcon, PlusIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icons } from "./icons";

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [openMarket, setOpenMarket] = useState(false);
  const [openCustomerSupport, setOpenCustomerSupport] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState("10000");
  const [quantities, setQuantities] = useState([1, 1, 1]);
  const [checked, setChecked] = useState([false, false, false]);

  const updateQuantity = (index: number, value: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(1, value);
    setQuantities(newQuantities);
  };

  const toggleChecked = (index: number) => {
    const newChecked = [...checked];
    newChecked[index] = !newChecked[index];
    setChecked(newChecked);
  };

  // const handleOpen = (newOpen: boolean) => {
  //   setOpen(newOpen);
  // };

  return (
    <div className="hidden lg:flex py-2 items-center">
      <div className="max-w-[80rem] mx-auto flex w-full justify-between">
        <Link href="/">
          <Image src="/logo1.png" width={100} height={25} alt="logo" />
        </Link>
        <div className="flex items-center gap-10">
          <Popover open={openMarket} onOpenChange={setOpenMarket}>
            <PopoverTrigger asChild className="cursor-pointer">
              <Button variant="ghost">
                <Image src="/basket.png" width={25} height={25} alt="basket" />
                위투 마켓
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[700px] p-0" align="start">
              <div className="flex flex-col bg-gray-100">
                {/* Header */}
                <div className="bg-[#2d3142] text-white p-3 flex justify-between items-center">
                  <h1 className="text-lg font-bold">위투 마켓</h1>
                  <button
                    className="text-white cursor-pointer"
                    onClick={() => setOpenMarket(false)}
                  >
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    {/* Card 1 */}
                    <div className="bg-white rounded-lg overflow-hidden border border-red-200">
                      <div className="p-4 flex flex-col items-center">
                        <div className="w-full h-20 bg-amber-100 rounded-md mb-3 flex items-center justify-center">
                          <div className="bg-amber-200 w-10 h-10 rounded-full"></div>
                        </div>

                        <h3 className="font-medium text-center mb-2 text-xs">
                          회원 전적 초기화(통합)
                        </h3>

                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center">
                            <Checkbox
                              id="check1"
                              className="mr-1 h-3 w-3 rounded-full bg-red-500 border-red-500"
                              checked={checked[0]}
                              onCheckedChange={() => toggleChecked(0)}
                            />
                            <span className="text-gray-700 text-xs">
                              10,000 캐시
                            </span>
                          </div>

                          <div className="flex items-center border rounded">
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(0, quantities[0] - 1)
                              }
                            >
                              <MinusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                            <input
                              type="text"
                              value={quantities[0]}
                              onChange={(e) =>
                                updateQuantity(
                                  0,
                                  Number.parseInt(e.target.value) || 1
                                )
                              }
                              className="w-8 text-center text-xs"
                            />
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(0, quantities[0] + 1)
                              }
                            >
                              <PlusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="cursor-pointer w-full bg-red-500 text-white py-2 text-xs font-medium">
                        구매하기 (선물가능)
                      </button>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white rounded-lg overflow-hidden border border-blue-200">
                      <div className="p-4 flex flex-col items-center">
                        <div className="w-full h-20 bg-blue-100 rounded-md mb-3 flex items-center justify-center">
                          <div className="bg-blue-200 w-10 h-10 rounded-full"></div>
                        </div>

                        <h3 className="font-medium text-center mb-2 text-xs">
                          채팅방 전적 초기화
                        </h3>

                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center">
                            <Checkbox
                              id="check2"
                              className="mr-1 h-3 w-3 rounded-full bg-red-500 border-red-500"
                              checked={checked[1]}
                              onCheckedChange={() => toggleChecked(1)}
                            />
                            <span className="text-gray-700 text-xs">
                              300 캐시
                            </span>
                          </div>

                          <div className="flex items-center border rounded">
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(1, quantities[1] - 1)
                              }
                            >
                              <MinusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                            <input
                              type="text"
                              value={quantities[1]}
                              onChange={(e) =>
                                updateQuantity(
                                  1,
                                  Number.parseInt(e.target.value) || 1
                                )
                              }
                              className="w-8 text-center text-xs"
                            />
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(1, quantities[1] + 1)
                              }
                            >
                              <PlusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-red-500 text-white py-2 text-xs font-medium cursor-pointer">
                        구매하기 (선물가능)
                      </button>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white rounded-lg overflow-hidden border border-teal-200">
                      <div className="p-4 flex flex-col items-center">
                        <div className="w-full h-20 bg-teal-100 rounded-md mb-3 flex items-center justify-center">
                          <div className="bg-teal-200 w-10 h-10 rounded-full"></div>
                        </div>

                        <h3 className="font-medium text-center mb-2 text-xs">
                          메시지 아용권
                        </h3>

                        <div className="flex items-center justify-between w-full mb-2">
                          <div className="flex items-center">
                            <Checkbox
                              id="check3"
                              className="mr-1 h-3 w-3 rounded-full bg-red-500 border-red-500"
                              checked={checked[2]}
                              onCheckedChange={() => toggleChecked(2)}
                            />
                            <span className="text-gray-700 text-xs">
                              300 캐시
                            </span>
                          </div>

                          <div className="flex items-center border rounded">
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(2, quantities[2] - 1)
                              }
                            >
                              <MinusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                            <input
                              type="text"
                              value={quantities[2]}
                              onChange={(e) =>
                                updateQuantity(
                                  2,
                                  Number.parseInt(e.target.value) || 1
                                )
                              }
                              className="w-8 text-center text-xs"
                            />
                            <button
                              className="px-1 py-0.5"
                              onClick={() =>
                                updateQuantity(2, quantities[2] + 1)
                              }
                            >
                              <PlusIcon className="w-3 h-3 text-gray-500 cursor-pointer" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-red-500 text-white py-2 text-xs font-medium cursor-pointer">
                        구매하기 (선물가능)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

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

          <Popover
            open={openCustomerSupport}
            onOpenChange={setOpenCustomerSupport}
          >
            <PopoverTrigger asChild className="cursor-pointer">
              <Button variant="ghost">
                <Image
                  src="/computer.png"
                  width={25}
                  height={25}
                  alt="computer"
                />
                고객센터
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[380px] rounded-none" align="end">
              <div className="overflow-hidden rounded-none">
                <div className="bg-[#434753] py-3 px-4 flex justify-between items-center">
                  <h3 className="text-white font-medium text-xs">
                    소셜 문의 안내
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 cursor-pointer w-6 text-white hover:bg-[#5a5f6b]"
                    onClick={() => setOpenCustomerSupport(false)}
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-4">
                  {/* KakaoTalk Button */}
                  <button className="w-full bg-[#e5d862] rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 relative flex-shrink-0 bg-[#FEE500] rounded-lg flex items-center justify-center">
                      <Icons.kakaoIcon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-center">
                        카카오톡 1:1 상담
                      </div>
                      <div className="text-xs text-center">
                        클릭하시면 이동됩니다
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      입금출금
                      <br />
                      불편사항
                      <br />
                      관련문의
                    </div>
                  </button>

                  {/* Telegram Button */}
                  <button className="w-full bg-[#E3F2FD] rounded-xl p-4 flex items-center space-x-4">
                    <div className="w-12 h-12 relative flex-shrink-0 bg-[#229ED9] rounded-lg flex items-center justify-center">
                      <Icons.telegramIcon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xl font-bold text-center">
                        텔레그램 1:1 상담
                      </div>
                      <div className="text-xs text-center">
                        클릭하시면 이동됩니다
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      입금출금
                      <br />
                      불편사항
                      <br />
                      관련문의
                    </div>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
