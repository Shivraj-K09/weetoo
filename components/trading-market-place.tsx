import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Minus, Plus, PlusMinus } from "@phosphor-icons/react/dist/ssr";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function TradingMarketPlace() {
  const percentages = [10, 25, 50, 75, 100];

  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-fit border border-[#3f445c]">
      <div className="flex gap-1.5">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 border-white/10 h-8 rounded-none cursor-pointer justify-between !text-xs bg-[#1a1e27] hover:bg-transparent hover:text-white"
            >
              <span>교차</span>
              <ChevronDownIcon className="h-4 w-4 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 border-white/10 h-8 rounded-none cursor-pointer justify-between !text-xs bg-[#1a1e27] hover:bg-transparent hover:text-white"
            >
              <span>교차</span>
              <ChevronDownIcon className="h-4 w-4 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-[0.715rem] flex-col w-full">
        <div className="flex justify-between items-center w-full">
          <Tabs defaultValue="tab-1" className="flex-1">
            <div className="flex justify-between items-center">
              <TabsList className="h-auto rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="tab-1"
                  className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer text-xs"
                >
                  지정가
                </TabsTrigger>
                <TabsTrigger
                  value="tab-2"
                  className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer text-xs"
                >
                  시장가
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1.5">
                <Checkbox
                  id="checkbox"
                  className="h-4 w-4 border-[#f97316] text-white data-[state=checked]:bg-[#f97316] data-[state=checked]:border-[#f97316]"
                />
                <Label htmlFor="checkbox" className="text-xs text-white">
                  알림음
                </Label>
              </div>
            </div>
            <TabsContent value="tab-1" className="text-white px-1">
              <div className="flex gap-1.5 flex-col">
                <Label className="text-xs text-white/60">주문가격</Label>
                <div className="relative">
                  <Input className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white" />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
                    <div className="text-xs text-[#f97316] pointer-events-none">
                      현재가
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="text-xs text-white/70 cursor-pointer">
                          <PlusMinus className="w-4 h-4" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-24 p-0 border-white/30 rounded overflow-hidden bg-[#212631]"
                        align="end"
                      >
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-white/30">
                              <th className="text-center hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  <Plus className="w-3 h-3 mx-auto" />
                                </button>
                              </th>
                              <th className="text-center border-l border-white/30 hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  <Minus className="w-3 h-3 mx-auto" />
                                </button>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-white/30">
                              <td className="text-center hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  1
                                </button>
                              </td>
                              <td className="text-center border-l border-white/30 hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  -1
                                </button>
                              </td>
                            </tr>
                            <tr className="border-b border-white/30">
                              <td className="text-center hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  5
                                </button>
                              </td>
                              <td className="text-center border-l border-white/30 hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  -5
                                </button>
                              </td>
                            </tr>
                            <tr className="border-b border-white/30">
                              <td className="text-center hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  20
                                </button>
                              </td>
                              <td className="text-center border-l border-white/30 hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  -20
                                </button>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-center hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  C
                                </button>
                              </td>
                              <td className="text-center border-l border-white/30 hover:bg-white/10 cursor-pointer p-0">
                                <button className="text-xs text-white/70 p-1.5 w-full">
                                  <ArrowLeftIcon className="w-3 h-3 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tab-2" className="text-white px-1">
              <div className="flex gap-1.5 flex-col">
                <Label className="text-xs text-white/60">주문가격</Label>
                <div className="relative">
                  <Input className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white" />
                  <div className="absolute right-0 top-0 h-full flex items-center gap-3 pr-3"></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex gap-1.5 flex-col">
          <Label className="text-xs text-white/60">주문수량</Label>
          <div className="relative">
            <Input className="h-8 text-white focus-visible:ring-0 focus-visible:border-[#f97316] border border-white/30 rounded text-xs pr-24 bg-transparent selection:bg-[#f97316] selection:text-white" />
            <div className="text-xs text-white/75 absolute right-0 top-0 h-full flex items-center gap-3 pr-3">
              BTC
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="border border-white/20 rounded p-2">
            <div className="flex justify-between">
              {percentages.map((percent) => (
                <button
                  key={percent}
                  className="text-xs text-white/70 hover:text-white min-w-[40px] text-center"
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          <div className="border border-white/20 rounded p-2 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">매수수료</span>
                <span className="text-xs text-[#00C879]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">매수수료</span>
                <span className="text-xs text-[#00C879]">0</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">매도비용</span>
                <span className="text-xs text-[#FF5252]">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/70">매도비용</span>
                <span className="text-xs text-[#FF5252]">0</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button className="bg-[#00C879] hover:bg-[#00C879]/90 text-white py-2.5 rounded text-sm font-medium">
              매수 / Long
            </button>
            <button className="bg-[#FF5252] hover:bg-[#FF5252]/90 text-white py-2.5 rounded text-sm font-medium">
              매도 / Short
            </button>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">평가</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">보유</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">가능</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20">
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">강체청산</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">환율</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-white/70">수수료</span>
              <span className="text-xs text-[#00C879]">0</span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="bg-transparent rounded-none h-8"
          disabled
        >
          재충전
        </Button>

        <div className="flex w-full flex-col">
          <Button
            variant="outline"
            className="bg-transparent rounded-none h-8"
            disabled
          >
            재충전
          </Button>
          <Button
            variant="outline"
            className="bg-transparent rounded-none h-8"
            disabled
          >
            재충전
          </Button>
        </div>
      </div>
    </div>
  );
}
