import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EducationPostClient from "./client";

export default async function CreateEducationPostPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/education-board/create-post");
  }

  return <EducationPostClient />;
}
