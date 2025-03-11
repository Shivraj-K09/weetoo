import Image from "next/image";
import { Button } from "./ui/button";

export function RefundFee() {
  return (
    <div className="bg-white flex flex-col rounded-md pt-2 h-[12rem]">
      <div className="flex flex-col">
        <span className="text-[0.6875rem]">다른 사람들은</span>
        <span className="text-[0.6875rem]">돌려받는 수수료 얼마일까?</span>
      </div>
      <div className="flex flex-col gap-1 items-center justify-center w-full mt-1">
        <Image src="/refund.png" alt="refund-fee" width={300} height={500} />
        <Button className="w-full bg-[#3f5ae7] hover:bg-transparent hover:border hover:border-[#3f5ae7] hover:text-[#3f5ae7] text-white text-xs transition-colors duration-200 ease-in-out rounded-full h-10 cursor-pointer">
          나도 예상 환급액 조회하기
        </Button>
      </div>
    </div>
  );
}
