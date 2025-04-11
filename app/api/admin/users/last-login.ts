import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface UserSession {
  user_id: string;
  created_at: string;
}

interface LastLoginMap {
  [key: string]: string;
}

export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Process the data to get the last login for each user
    const lastLogins = (data as UserSession[]).reduce<LastLoginMap>(
      (acc, session) => {
        if (
          !acc[session.user_id] ||
          new Date(acc[session.user_id]) < new Date(session.created_at)
        ) {
          acc[session.user_id] = session.created_at;
        }
        return acc;
      },
      {}
    );

    return NextResponse.json(lastLogins);
  } catch (error) {
    console.error("Error fetching last logins:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
