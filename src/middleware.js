import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
    const token = await getToken({ req });
    const path = req.nextUrl.pathname;

    // 1. Strict Protection for Seller and Admin Dashboards
    // Guests accessing these should be redirected to login
    if (path.startsWith("/dashboard/seller") || path.startsWith("/dashboard/admin")) {
        if (!token) {
            const url = new URL("/login", req.url);
            url.searchParams.set("callbackUrl", path);
            return NextResponse.redirect(url);
        }
    }

    // 2. Profile Completion Check
    // If user is logged in BUT requires profile completion, force them to /complete-profile
    // Allow access to /complete-profile itself and signout
    if (token && token.requiresProfileCompletion) {
        if (path !== "/complete-profile" && !path.startsWith("/api/")) {
            return NextResponse.redirect(new URL("/complete-profile", req.url));
        }
    }

    // 3. Reverse Check: If profile IS complete, don't let them visit /complete-profile
    if (token && !token.requiresProfileCompletion && path === "/complete-profile") {
        return NextResponse.redirect(new URL(`/dashboard/${token.role}`, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/complete-profile"
    ]
};
