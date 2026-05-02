import { NextResponse, type NextRequest } from "next/server";
import { getRequestSession } from "@/lib/auth";

const protectedPrefixes = ["/dashboard", "/receipts", "/customers", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = await getRequestSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/receipts/:path*", "/customers/:path*", "/settings/:path*"]
};
