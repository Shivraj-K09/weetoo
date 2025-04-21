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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Minus, Plus, PlusMinus } from "@phosphor-icons/react/dist/ssr";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function TradingMarketPlace() {
  const [selectedMode, setSelectedMode] = useState<"Cross" | "Isolated">(
    "Cross"
  );
  const [open, setOpen] = useState(false);
  const [leverageOpen, setLeverageOpen] = useState(false);
  const [leverage, setLeverage] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [sliderValue, setSliderValue] = useState(1);
  const sliderRef = useRef<HTMLInputElement>(null);

  const leverageOptions = [1, 10, 20, 30, 40, 50, 60, 70, 80, 100];

  // Update input when slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    setSliderValue(value);
    setInputValue(value.toString());
  };

  // Update slider when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Only update slider if value is a valid number
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setSliderValue(numValue);
    }
  };

  // Set final leverage value when dialog is closed
  const handleConfirm = () => {
    const numValue = Number.parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setLeverage(numValue);
    }
    setLeverageOpen(false);
  };

  // Reset to current leverage when dialog is opened
  useEffect(() => {
    if (leverageOpen) {
      setInputValue(leverage.toString());
      setSliderValue(leverage);
    }
  }, [leverageOpen, leverage]);

  const percentages = [10, 25, 50, 75, 100];

  return (
    <div className="bg-[#212631] p-2 rounded max-w-[290px] w-full h-fit border border-[#3f445c]">
      <div className="flex gap-1.5 w-full">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center w-full cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <span className="text-sm font-medium">교차</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            <div className="bg-[#1a1e27] rounded-lg overflow-hidden border border-white/10 shadow-xl">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h2 className="text-white text-lg font-medium">
                  Choose Margin Mode
                </h2>
              </div>

              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={cn(
                      "relative flex items-center gap-3 p-3 rounded-md transition-all duration-200 cursor-pointer",
                      selectedMode === "Cross"
                        ? "bg-transparent border border-[#e74c3c]"
                        : "bg-[#2a2e39] border border-transparent"
                    )}
                    onClick={() => setSelectedMode("Cross")}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        selectedMode === "Cross"
                          ? "border-[#e74c3c]"
                          : "border-white/40"
                      )}
                    >
                      {selectedMode === "Cross" && (
                        <div className="w-2 h-2 rounded-full bg-[#e74c3c]"></div>
                      )}
                    </div>
                    <span className="text-white">Cross</span>
                  </button>

                  <button
                    className={cn(
                      "relative flex items-center gap-3 p-3 rounded-md transition-all duration-200 cursor-pointer",
                      selectedMode === "Isolated"
                        ? "bg-transparent border border-[#e74c3c]"
                        : "bg-[#2a2e39] border border-transparent"
                    )}
                    onClick={() => setSelectedMode("Isolated")}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center",
                        selectedMode === "Isolated"
                          ? "border-[#e74c3c]"
                          : "border-white/40"
                      )}
                    >
                      {selectedMode === "Isolated" && (
                        <div className="w-2 h-2 rounded-full bg-[#e74c3c]"></div>
                      )}
                    </div>
                    <span className="text-white">Isolated</span>
                  </button>
                </div>

                <div className="bg-[#2a2e39] p-4 rounded-md text-white/70 text-sm">
                  {selectedMode === "Cross" ? (
                    <>
                      If the loss exceeds the total holding amount (60%), it
                      will be liquidated.
                      <br />
                      <br />
                      When changed, all positions and unfilled orders for the
                      current item will be affected.
                    </>
                  ) : (
                    <>
                      If the position loss exceeds the position maintenance
                      margin(60%), it will be liquidated.
                      <br />
                      <br />
                      When changed, all positions and unfilled orders for the
                      current item will be affected.
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-[#e74c3c] hover:bg-[#e74d3ce0] text-white py-3 rounded-md font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-[#3a3e49] hover:bg-[#4a4e59] text-white py-3 rounded-md font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={leverageOpen} onOpenChange={setLeverageOpen}>
          <DialogTrigger asChild>
            <button className="flex w-full items-center cursor-pointer justify-between gap-2 px-4 py-2 bg-[#1a1e27] text-white rounded-md border border-white/10 hover:border-orange-500/50 transition-all duration-300">
              <span className="text-sm font-medium">{leverage}x</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
              >
                <path
                  d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </DialogTrigger>
          <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            <div className="bg-[#1a1e27] rounded-lg overflow-hidden border border-white/10 shadow-xl">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <h2 className="text-white text-lg font-medium">
                  Adjust Leverage
                </h2>
              </div>

              <div className="p-4 space-y-4">
                {/* Leverage input */}
                <div className="mb-6">
                  <p className="text-white/70 mb-2 text-sm">Leverage</p>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="w-full bg-[#2a2e39] text-white border border-white/10 rounded p-3 text-center text-lg"
                    onBlur={() => {
                      // Validate on blur
                      const numValue = Number.parseInt(inputValue, 10);
                      if (isNaN(numValue) || numValue < 1) {
                        setInputValue("1");
                        setSliderValue(1);
                      } else if (numValue > 100) {
                        setInputValue("100");
                        setSliderValue(100);
                      }
                    }}
                  />
                </div>

                {/* Slider */}
                <div className="relative">
                  <input
                    ref={sliderRef}
                    type="range"
                    min="1"
                    max="100"
                    value={sliderValue}
                    onChange={handleSliderChange}
                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e74c3c]"
                    style={{
                      background: `linear-gradient(to right, #e74c3c 0%, #e74c3c ${sliderValue}%, #2a2e39 ${sliderValue}%, #2a2e39 100%)`,
                    }}
                  />

                  {/* Leverage markers */}
                  <div className="flex justify-between mt-2 text-xs text-white/60">
                    {leverageOptions.map((option) => (
                      <div
                        key={option}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => {
                          setSliderValue(option);
                          setInputValue(option.toString());
                        }}
                      >
                        <div
                          className={`h-1 w-1 rounded-full mb-1 ${sliderValue >= option ? "bg-[#e74c3c]" : "bg-white/30"}`}
                        ></div>
                        <span>{option}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warning text */}
                <div className="bg-[#2a2e39] p-4 rounded-md text-sm">
                  <p className="text-[#e74c3c] mb-3">
                    It can be multiplied by up to x50 by default x, and can be
                    multiplied by x100 when using items.
                  </p>
                  <p className="text-white/70">
                    Add or subtract the quantity ratio that can be ordered based
                    on the amount held.
                  </p>
                  <p className="text-white/70 mt-3">
                    When changed, all positions and unfilled orders for the
                    current item will be affected.
                  </p>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleConfirm}
                    className="bg-[#e74c3c] hover:bg-[#d44235] text-white py-3 rounded-md font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setLeverageOpen(false)}
                    className="bg-[#3a3e49] hover:bg-[#4a4e59] text-white py-3 rounded-md font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
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
