import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/route";

/**
 * Middleware for protecting routes
 * Apply to /middleware.ts at project root
 *
 * Usage in middleware.ts:
 * ---
 * import { authMiddleware } from '@/lib/auth/middleware';
 * export const middleware = authMiddleware;
 * export const config = {
 *   matcher: ['/dashboard/:path*', '/api/protected/:path*'],
 * };
 * ---
 */
export async function authMiddleware(request: NextRequest) {
  const session = await auth();

  // Redirect to signin if not authenticated
  if (!session) {
    const signinUrl = new URL("/auth/signin", request.url);
    signinUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

/**
 * Middleware for API route protection
 * Returns 401 if not authenticated
 */
export async function protectedApiMiddleware(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Attach user to request for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.user.id);
  requestHeaders.set("x-user-email", session.user.email || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Middleware for checking user plan
 */
export function planMiddleware(requiredPlan: "starter" | "pro" | "enterprise") {
  return async (request: NextRequest) => {
    const session = await auth();

    if (!session?.user?.plan) {
      return NextResponse.json(
        { error: "Unauthorized: No plan found" },
        { status: 401 },
      );
    }

    const planHierarchy = {
      starter: 0,
      pro: 1,
      enterprise: 2,
    };

    const userPlanLevel = planHierarchy[session.user.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      return NextResponse.json(
        { error: `Upgrade required: ${requiredPlan} plan needed` },
        { status: 403 },
      );
    }

    return NextResponse.next();
  };
}

/**
 * Middleware for rate limiting (stub)
 */
export function rateLimitMiddleware(
  maxRequests: number = 100,
  windowMs: number = 60 * 1000,
) {
  return async (request: NextRequest) => {
    // TODO: Implement rate limiting with Redis or similar
    // Store request count per user/IP
    // Return 429 if exceeded

    return NextResponse.next();
  };
}
