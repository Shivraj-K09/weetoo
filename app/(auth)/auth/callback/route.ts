// Update the callback route to handle errors better and log them

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  // If there's an error in the URL, redirect to error page with the error description
  if (error) {
    console.error("Auth error:", error, error_description);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-code-error?error=${encodeURIComponent(error_description || error)}`
    );
  }

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}${next}`
      );
    } else {
      console.error("Session exchange error:", error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL}/auth/auth-code-error`
  );
}
