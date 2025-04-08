"use client";

import type React from "react";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserTable } from "@/components/admin/users/users-table";
import { useUserSearch } from "@/components/admin/users/user-table-search";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { updateSearchTerm } = useUserSearch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateSearchTerm(value);
  };

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
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <UserTable searchTerm={searchTerm} />
      </div>
    </>
  );
}
