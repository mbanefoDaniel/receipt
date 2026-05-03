import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";

const protectedPrefixes = ["/dashboard", "/receipts", "/customers", "/settings"];

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return applySecurityHeaders(NextResponse.next());
  }

  const session = await getRequestSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/dashboard/:path*", "/receipts/:path*", "/customers/:path*", "/settings/:path*"]
};
