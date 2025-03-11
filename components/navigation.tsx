import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MenuIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

export function Navigation() {
  return (
    <>
      <div className="bg-[#E74C3C] w-full lg:inline-flex py-3.5 text-white items-center hidden">
        <div className="mx-auto container">
          <div className="flex items-center justify-center gap-20 xl:gap-36">
            {/* <Link href="/trader">트레이더</Link>
            <Link href="/community">커뮤니티</Link>
            <Link href="/investment">투자대회</Link>
            <Link href="/news">뉴스</Link>
            <Link href="/exchange">거래소</Link> */}
            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className="cursor-pointer">
                <Button variant="ghost" className="text-white font-semibold">
                  트레이더
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-50 bg-[#3498DB] p-0 text-white border-none">
                <div className="flex flex-col gap-2 p-4">
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>트레이딩</span>
                  </div>
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>트레이더 순위</span>
                  </div>

                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>kor_coin 순위</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className="cursor-pointer">
                <Button variant="ghost" className="text-white font-semibold">
                  커뮤니티
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-50 bg-[#3498DB] p-0 text-white border-none">
                <div className="flex flex-col gap-2 p-4">
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>자유 게시판</span>
                  </div>
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>수익 게시판</span>
                  </div>

                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>교육 게시판</span>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Button
              variant="ghost"
              className="text-white font-semibold cursor-pointer"
            >
              투자대회
            </Button>

            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className="cursor-pointer">
                <Button variant="ghost" className="text-white font-semibold">
                  뉴스
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-50 bg-[#3498DB] p-0 text-white border-none">
                <div className="flex flex-col gap-2 p-4">
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>국내</span>
                  </div>
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>해외</span>
                  </div>
                </div>
              </HoverCardContent>{" "}
            </HoverCard>

            <HoverCard openDelay={0}>
              <HoverCardTrigger asChild className="cursor-pointer">
                <Button variant="ghost" className="text-white font-semibold">
                  거래소
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-54 bg-[#3498DB] p-0 text-white border-none">
                <div className="flex flex-col gap-2 p-4">
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>해외선물 거래소 비교</span>
                  </div>
                  <div className="hover:bg-[#90c2e4] rounded px-4 py-1.5 cursor-pointer">
                    <span>코인선물 거래소 비교</span>
                  </div>
                </div>
              </HoverCardContent>{" "}
            </HoverCard>
          </div>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-between w-full py-2 px-4 h-[3.45rem] border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" aria-label="Menu">
              <MenuIcon className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-44">
            <VisuallyHidden>
              <SheetHeader>
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
            </VisuallyHidden>
            <div className="flex flex-col w-full pt-2">
              <div className="flex items-center justify-center w-full">
                <Image src="/logo1.png" width={100} height={25} alt="logo" />
              </div>

              {/* Navlinks */}
              <div className="flex flex-col items-center gap-5 mt-5">
                <Link href="/trader">트레이더</Link>
                <Link href="/community">커뮤니티</Link>
                <Link href="/investment">투자대회</Link>
                <Link href="/news">뉴스</Link>
                <Link href="/exchange">거래소</Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Image src="/logo1.png" width={100} height={25} alt="logo" />

        {/* profile image */}
        <div className="border p-1 rounded-full" aria-label="profile image">
          <UserIcon className="w-5 h-5" />
        </div>
      </div>
    </>
  );
}
