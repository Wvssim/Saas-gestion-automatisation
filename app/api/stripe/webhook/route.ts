import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db/client";
import Stripe from "stripe";

export const runtime = "nodejs";

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) {
    console.error("[Stripe] Missing client_reference_id in checkout session");
    return;
  }

  const plan = (session.metadata?.plan as "pro" | "enterprise") || "pro";

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan,
      stripeCustomerId: session.customer as string,
      subscriptionStatus: "active",
    },
  });

  console.log("[Stripe] User plan updated to", plan, "userId:", userId);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("[Stripe] User not found for customer:", customerId);
    return;
  }

  const status = subscription.status;
  let planName = user.plan;

  // Map Stripe status to plan names
  if (status === "past_due") {
    planName = user.plan; // Keep current plan but mark as past due
  } else if (status === "canceled" || status === "unpaid") {
    planName = "starter"; // Downgrade on cancellation
  }

  // Calculate subscription end date
  const endsAt = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: planName,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionEndsAt: endsAt,
    },
  });

  console.log("[Stripe] Subscription updated:", {
    userId: user.id,
    status,
    plan: planName,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!user) {
    console.error("[Stripe] User not found for customer:", customerId);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "starter",
      stripeSubscriptionId: null,
      subscriptionStatus: "canceled",
      subscriptionEndsAt: new Date(),
    },
  });

  console.log("[Stripe] Subscription deleted, downgraded to starter:", user.id);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing webhook configuration" },
      { status: 400 },
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("[Stripe] Webhook signature error", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        );
        break;
      default:
        console.log("[Stripe] Unhandled event type:", event.type);
    }
  } catch (error) {
    console.error("[Stripe] Webhook handling error", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
