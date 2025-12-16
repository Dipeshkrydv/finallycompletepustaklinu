import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const rateLimit = new Map();

// Basic Rate Limiter for Middleware (In-Memory)
// Note: In strict Edge environments, this Map might not persist across all requests, 
// but it works for single-instance deployments and provides a layer of protection.
function checkRateLimit(ip) {
    // Bypass rate limiting in development
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = 100; // Increased to 100 requests per minute

    const record = rateLimit.get(ip);
    if (!record) {
        rateLimit.set(ip, { count: 1, startTime: now });
        return true;
    }

    if (now - record.startTime > windowMs) {
        rateLimit.set(ip, { count: 1, startTime: now });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    return true;
}

export async function middleware(req) {
    // Better IP detection for proxies (Vercel, Hostinger, Cloudflare)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0] : (req.ip || "127.0.0.1");

    const path = req.nextUrl.pathname;

    // Rate Limit Sensitive Routes
    if (path.startsWith('/api/auth') || path.startsWith('/api/register') || path.startsWith('/api/otp')) {
        if (!checkRateLimit(ip)) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }
    }

    const token = await getToken({ req });


    // 1. Strict Protection for Seller and Admin Dashboards
    if (path.startsWith("/dashboard/seller")) {
        if (!token || token.role !== 'seller') {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    if (path.startsWith("/dashboard/admin")) {
        if (!token || token.role !== 'admin') {
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // 2. Admin Containment: Admins cannot access public pages
    // If logged in as admin, force them to dashboard unless they are on dashboard or api
    if (token && token.role === 'admin') {
        if (!path.startsWith("/dashboard/admin") && !path.startsWith("/api/")) {
            return NextResponse.redirect(new URL("/dashboard/admin", req.url));
        }
    }

    // 3. Profile Completion Check
    if (token && token.requiresProfileCompletion) {
        if (path !== "/complete-profile" && !path.startsWith("/api/")) {
            return NextResponse.redirect(new URL("/complete-profile", req.url));
        }
    }

    // 4. Reverse Check: If profile IS complete
    if (token && !token.requiresProfileCompletion && path === "/complete-profile") {
        return NextResponse.redirect(new URL(`/dashboard/${token.role}`, req.url));
    }

    // 5. Redirect to dashboard if already logged in and on login page
    if (token && path === "/login") {
        if (token.requiresProfileCompletion) {
            return NextResponse.redirect(new URL("/complete-profile", req.url));
        }
        return NextResponse.redirect(new URL(`/dashboard/${token.role}`, req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/dashboard/:path*",
        "/complete-profile",
        "/api/auth/:path*",
        "/api/register",
        "/api/otp/:path*"
    ]
};
