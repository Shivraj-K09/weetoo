"use server";

import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  kor_coins: number;
  nickname: string | null;
  level: number;
  exp: number;
  created_at: string;
  status: string;
  role: string;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const cookieStore = cookies();
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("users")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        kor_coins,
        nickname,
        level,
        exp,
        created_at,
        status,
        role
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}
