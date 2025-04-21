import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/auth/roles";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const isAdminUser = await isAdmin();
  const { pathname } = request.nextUrl;

  if (!isAdminUser) {
    return NextResponse.redirect(new URL("/restricted", request.url));
  }

  if (pathname === "/admin/manage-posts") {
    try {
      console.log("Middleware: Triggering auto-approve API");

      // Call the auto-approve API endpoint
      const response = await fetch(
        `${request.nextUrl.origin}/api/admin/auto-approve`,
        {
          method: "GET",
          headers: {
            Cookie: request.headers.get("cookie") || "",
          },
        }
      );

      // Log the response for debugging
      if (!response.ok) {
        console.error(
          "Middleware: Auto-approve API returned an error:",
          await response.text()
        );
      } else {
        const result = await response.json();
        console.log("Middleware: Auto-approve API result:", result);
      }
    } catch (error) {
      console.error("Middleware: Error calling auto-approve API:", error);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/admin/:path*",
};
