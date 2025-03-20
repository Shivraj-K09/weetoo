"use client";

import Image from "next/image";
import { MobileCarousel } from "./mobile-carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChatRoom } from "./chat-room";

export function MobileContent() {
  return (
    <div className="h-full flex flex-col w-full lg:hidden relative">
      <div className="py-3 bg-[#0f2229] text-center text-white">
        <span className="font-semibold uppercase">Top 5 Profilt</span>
      </div>

      <MobileCarousel />

      {/* <h2 className="flex items-center justify-center">Under construction</h2> */}
      <div className="bg-[#0f2229] p-5">
        <div className="flex w-full">
          <div className="w-full text-white">
            <div className="flex items-center gap-2">
              <Image src="/crown.png" alt="coins" width={25} height={25} />
              <h5 className="text-xs">일간 수익률 순위 TOP5</h5>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-white">
            <div className="flex items-center gap-2">
              <Image src="/crown.png" alt="coins" width={25} height={25} />
              <h5 className="text-xs">일간 수익률 순위 TOP5</h5>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent" />
                  <span className="text-sm">Name</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-muted-foreground text-xs">NAS100</span>
                  <span className="text-xs">+15,874%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto bg-white">
        {/* Header */}
        <header className="flex justify-between items-center p-3 border-b">
          <h1 className="text-xl font-bold text-gray-700">커뮤니티</h1>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-medium text-sm">핫이슈</span>
            <span className="text-gray-400 text-sm">|</span>
            <span className="text-gray-500 text-sm">최신글</span>
          </div>
        </header>

        {/* Post listings */}
        <div className="px-3">
          {/* Post item 1 */}
          <div className="flex justify-between items-center py-3 border-b">
            <div className="flex items-center">
              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                유머/포토
              </span>
              <span className="ml-2 text-gray-800 text-xs">
                첫번째 게시글 제목
              </span>
            </div>
            <span className="text-gray-400 text-xs">25.03.10 11:58</span>
          </div>

          {/* Post item 2 */}
          <div className="flex justify-between items-center py-3 border-b">
            <div className="flex items-center">
              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                유머/포토
              </span>
              <span className="ml-2 text-gray-800 text-xs">
                두번째 게시글 제목
              </span>
            </div>
            <span className="text-gray-400 text-xs">25.03.10 11:58</span>
          </div>

          {/* Post item 3 */}
          <div className="flex justify-between items-center py-3 border-b">
            <div className="flex items-center">
              <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full">
                유머/포토
              </span>
              <span className="ml-2 text-gray-800 text-xs">
                세번째 게시글 제목
              </span>
            </div>
            <span className="text-gray-400 text-xs">25.03.10 11:58</span>
          </div>
        </div>

        {/* Image carousel */}
        <div className="px-2 py-3">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 -mr-2">
              {/* Carousel item 1 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    언더웨어 모음
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 2 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-300 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    3명의 메이드너
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 3 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    이동국 딸
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 4 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-300 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    게임 캐릭터
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 5 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    스포츠 모음
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 6 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-300 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    여행 사진
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 7 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    음식 추천
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 8 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-300 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    패션 스타일
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>

              {/* Carousel item 9 */}
              <CarouselItem className="pl-2 basis-1/3">
                <div className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-md"></div>
                  <h3 className="mt-1 text-[10px] font-medium line-clamp-1">
                    일상 공유
                  </h3>
                  <span className="mt-0.5 bg-gray-100 text-gray-500 text-[8px] px-1 py-0.5 rounded-full w-fit">
                    유머/포토
                  </span>
                </div>
              </CarouselItem>
            </CarouselContent>
            <div className="flex justify-center mt-1">
              <CarouselPrevious className="relative mr-2 h-6 w-6" />
              <CarouselNext className="relative h-6 w-6" />
            </div>
          </Carousel>
        </div>
      </div>

      <ChatRoom />
    </div>
  );
}
