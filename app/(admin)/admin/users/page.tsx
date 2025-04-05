"use client";

import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/components/admin/users/users-table";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 w-[250px] shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shadow-none">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
            <Button variant="outline" size="icon" className="shadow-none">
              <Download className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
            <Button className="shadow-none">Add User</Button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <UserTable searchTerm={searchTerm} />
      </div>
    </>
  );
}
