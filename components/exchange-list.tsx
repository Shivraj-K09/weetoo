import { Button } from "./ui/button";

export function ExchangeList() {
  return (
    <div className="bg-[#F1EBF8] h-60 rounded-md p-2 overflow-y-auto no-scrollbar">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 bg-[#D5828E] rounded-full" />
            <div className="flex flex-col">
              <span className="text-xs">Bithumb</span>

              <span className="text-xs">0.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs">XYZ</span>
              <span className="font-semibold text-sm">40%</span>
            </div>

            <Button className="rounded-full bg-[#65558f] text-white h-8 cursor-pointer">
              신청하기
            </Button>
          </div>
        </div>

        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 bg-[#D5828E] rounded-full" />
            <div className="flex flex-col">
              <span className="text-xs">Bithumb</span>
              <span className="text-xs">0.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs">XYZ</span>
              <span className="font-semibold text-sm">40%</span>
            </div>

            <Button className="rounded-full bg-[#65558f] text-white h-8 cursor-pointer">
              신청하기
            </Button>
          </div>
        </div>

        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 bg-[#D5828E] rounded-full" />
            <div className="flex flex-col">
              <span className="text-xs">Bithumb</span>
              <span className="text-xs">0.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs">XYZ</span>
              <span className="font-semibold text-sm">40%</span>
            </div>

            <Button className="rounded-full bg-[#65558f] text-white h-8 cursor-pointer">
              신청하기
            </Button>
          </div>
        </div>

        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 bg-[#D5828E] rounded-full" />
            <div className="flex flex-col">
              <span className="text-xs">Bithumb</span>
              <span className="text-xs">0.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs">XYZ</span>
              <span className="font-semibold text-sm">40%</span>
            </div>

            <Button className="rounded-full bg-[#65558f] text-white h-8 cursor-pointer">
              신청하기
            </Button>
          </div>
        </div>

        <div className="flex justify-between w-full items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-10 bg-[#D5828E] rounded-full" />
            <div className="flex flex-col">
              <span className="text-xs">Bithumb</span>
              <span className="text-xs">0.00</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs">XYZ</span>
              <span className="font-semibold text-sm">40%</span>
            </div>

            <Button className="rounded-full bg-[#65558f] text-white h-8 cursor-pointer">
              신청하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
