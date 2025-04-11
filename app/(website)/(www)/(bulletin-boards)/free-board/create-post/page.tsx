import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreatePostClient } from "./client";

export default async function CreatePostPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/free-board/create-post");
  }

  return <CreatePostClient />;
}
