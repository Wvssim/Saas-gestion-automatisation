import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth/session";

function getOrigin(request: Request) {
  return (
    request.headers.get("origin") ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  try {
    const user = await getServerUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "Unauthorized", redirectUrl: "/auth/signin" },
        { status: 401 },
      );
    }

    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json(
        { error: "No billing profile found" },
        { status: 404 },
      );
    }

    const origin = getOrigin(request);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[Stripe] Portal error", error);
    return NextResponse.json(
      { error: "Failed to open billing portal" },
      { status: 500 },
    );
  }
}
