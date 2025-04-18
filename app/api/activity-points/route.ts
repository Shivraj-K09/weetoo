import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role to check if admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== "admin" && userData.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch all point transactions with user information
    const { data, error } = await supabase
      .from("point_transactions")
      .select(
        `
        *,
        user:user_id (
          id,
          first_name,
          last_name,
          avatar_url,
          uid
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching point transactions:", error);
      return NextResponse.json(
        { error: "Failed to fetch activity points" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in activity points API:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
