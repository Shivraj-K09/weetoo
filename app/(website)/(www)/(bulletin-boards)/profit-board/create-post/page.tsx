import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfitPostClient from "./client";

export default async function CreateProfitPostPage() {
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/profit-board/create-post");
  }

  return <ProfitPostClient />;
}
