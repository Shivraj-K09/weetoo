"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "./users-table";

export function useUserSearch(initialSearchTerm = "") {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("users").select("*");

        if (error) {
          console.error("Error fetching users:", error);
          return;
        }

        setUsers(data || []);
        setFilteredUsers(data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter((user) => {
      const fullName =
        `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      const id = (user.id || "").toLowerCase();

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        id.includes(searchLower)
      );
    });

    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Update search term
  const updateSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    updateSearchTerm,
  };
}
