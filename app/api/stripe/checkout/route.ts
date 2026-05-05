import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerUser } from "@/lib/auth/session";

type PlanKey = "pro" | "enterprise";

type PlanConfig = {
  name: string;
  amount: number;
  interval: "month";
  description: string;
};

const planConfig: Record<PlanKey, PlanConfig> = {
  pro: {
    name: "SellFlow Pro",
    amount: 3900,
    interval: "month",
    description: "Automation-ready ops for growing teams.",
  },
  enterprise: {
    name: "SellFlow Enterprise",
    amount: 14900,
    interval: "month",
    description: "Advanced controls with dedicated onboarding.",
  },
};

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

    const body = await request.json();
    const plan = body?.plan as PlanKey;

    if (!plan || !planConfig[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const origin = getOrigin(request);
    const config = planConfig[plan];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      allow_promotion_codes: true,
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${origin}/dashboard/settings?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: config.amount,
            recurring: { interval: config.interval },
            product_data: {
              name: config.name,
              description: config.description,
            },
          },
        },
      ],
      metadata: {
        userId: user.id,
        plan,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe] Checkout error", error);
    return NextResponse.json(
      { error: "Failed to create checkout" },
      { status: 500 },
    );
  }
}
