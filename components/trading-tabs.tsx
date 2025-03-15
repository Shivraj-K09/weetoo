import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TradingTabs() {
  return (
    <Tabs defaultValue="tab-1">
      <TabsList className="h-auto rounded-none bg-transparent p-0">
        <TabsTrigger
          value="tab-1"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer"
        >
          호가창
        </TabsTrigger>
        <TabsTrigger
          value="tab-2"
          className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:text-[#f97316] data-[state=active]:shadow-none text-white data-[state=active]:border-b-[#f97316] cursor-pointer"
        >
          최근거래
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1" className="text-white px-1">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-accent" />
            <div className="w-6 h-6 bg-accent" />
            <div className="w-6 h-6 bg-accent" />
            <div className="w-6 h-6 bg-accent" />
          </div>

          <Select defaultValue="0.1">
            <SelectTrigger className="w-[100px] h-8 rounded-none bg-[#171920] border-none text-white">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent className="!min-w-[100px] rounded-none bg-[#171920] border-none text-white">
              <SelectItem value="0.1" className="!h-8 rounded-none">
                0.1
              </SelectItem>
              <SelectItem value="1" className="!h-8 rounded-none">
                1
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TabsContent>
      <TabsContent value="tab-2" className="text-white"></TabsContent>
    </Tabs>
  );
}
