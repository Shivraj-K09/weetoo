"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notification } from "@/components/admin/notification/notification";

export default function NotificationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Notification Center</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-9 w-[250px] shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shadow-none">
              Mark all as read
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <Notification searchTerm={searchTerm} />
      </div>
    </>
  );
}
