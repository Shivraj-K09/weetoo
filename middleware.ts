import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth/roles";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const isAdminUser = await isAdmin();

  if (!isAdminUser) {
    return NextResponse.redirect(new URL("/restricted", request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin/:path*",
};
