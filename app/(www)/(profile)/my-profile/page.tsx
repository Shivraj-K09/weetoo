import { ShieldUserIcon } from "lucide-react";
import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyProfile() {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col w-full">
        <Image
          src="/banner.png"
          alt="trader-banner"
          width={1000}
          height={250}
          className="w-full rounded"
        />
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <ShieldUserIcon className="w-6 h-6" />
        <span className="text-sm">마이페이지</span>
      </div>

      <div className="mt-3 w-full flex flex-col">
        <Tabs defaultValue="tab-1">
          <TabsList className="bg-transparent w-full">
            <TabsTrigger
              value="tab-1"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none w-full"
            >
              Tab 1
            </TabsTrigger>
            <TabsTrigger
              value="tab-2"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none w-full"
            >
              Tab 2
            </TabsTrigger>
            <TabsTrigger
              value="tab-3"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none w-full"
            >
              Tab 3
            </TabsTrigger>

            <TabsTrigger
              value="tab-4"
              className="data-[state=active]:bg-muted data-[state=active]:shadow-none w-full"
            >
              Tab 4
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">
            <p className="text-muted-foreground p-4 text-xs">
              Content for Tab 1
            </p>
          </TabsContent>
          <TabsContent value="tab-2">
            <p className="text-muted-foreground p-4 text-xs">
              Content for Tab 2
            </p>
          </TabsContent>
          <TabsContent value="tab-3">
            <p className="text-muted-foreground p-4 text-xs">
              Content for Tab 3
            </p>
          </TabsContent>
          <TabsContent value="tab-4">
            <p className="text-muted-foreground p-4 text-xs">
              Content for Tab 4
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
