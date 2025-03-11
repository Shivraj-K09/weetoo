import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { MenuIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
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
            <Link href="/trader">트레이더</Link>
            <Link href="/community">커뮤니티</Link>
            <Link href="/investment">투자대회</Link>
            <Link href="/news">뉴스</Link>
            <Link href="/exchange">거래소</Link>
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
          <SheetContent side="left" className="w-80">
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
