"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Space_Grotesk } from "next/font/google";
import { Button } from "@/components/ui/button";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

type PlanKey = "starter" | "pro" | "enterprise";

type Plan = {
  key: PlanKey;
  title: string;
  price: string;
  cadence: string;
  description: string;
  highlights: string[];
  cta: string;
  tone: "core" | "accent" | "dark";
};

const plans: Plan[] = [
  {
    key: "starter",
    title: "Starter",
    price: "$0",
    cadence: "forever",
    description: "For solo sellers validating their store stack.",
    highlights: [
      "1 store connection",
      "Core analytics + alerts",
      "Weekly performance digest",
      "Community support",
    ],
    cta: "Start free",
    tone: "core",
  },
  {
    key: "pro",
    title: "Pro",
    price: "$39",
    cadence: "per month",
    description: "Automation-ready ops for growing teams.",
    highlights: [
      "Unlimited stores",
      "Real-time stock alerts",
      "Automation builder",
      "Priority email support",
    ],
    cta: "Launch Pro",
    tone: "accent",
  },
  {
    key: "enterprise",
    title: "Enterprise",
    price: "$149",
    cadence: "per month",
    description: "Advanced controls and dedicated onboarding.",
    highlights: [
      "Custom workflows",
      "Dedicated success lead",
      "SOC2-ready workflows",
      "Multi-region data",
    ],
    cta: "Talk to sales",
    tone: "dark",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async (plan: PlanKey) => {
    setError(null);
    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (payload?.redirectUrl) {
          router.push(payload.redirectUrl);
          return;
        }
        throw new Error(payload?.error || "Checkout failed");
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      throw new Error("Checkout url missing");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div
      className={`${spaceGrotesk.className} min-h-screen bg-[#050505] text-white`}
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(5,5,5,0))]" />
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_50%_10%,_#00f5d4,_#0ea5e9,_#f97316,_#facc15,_#00f5d4)] opacity-20" />
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute top-40 -left-20 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-16">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">
                Pricing
              </p>
              <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
                A pricing stack that scales with your revenue.
              </h1>
            </div>
            <Link
              href="/"
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/60 hover:text-white"
            >
              Back to home
            </Link>
          </header>

          <div className="mt-10 max-w-2xl text-sm text-white/70">
            Choose the plan that matches your operational pace. Upgrade in one
            click, keep your data, and stay in control of every automation.
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const isLoading = loadingPlan === plan.key;
              const isStarter = plan.key === "starter";
              const toneStyles =
                plan.tone === "accent"
                  ? "border-emerald-400/60 bg-gradient-to-br from-emerald-400/20 via-white/5 to-transparent shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                  : plan.tone === "dark"
                    ? "border-white/15 bg-white/5"
                    : "border-white/20 bg-white/10";

              return (
                <div
                  key={plan.key}
                  className={`rounded-3xl border p-6 backdrop-blur ${toneStyles}`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{plan.title}</h2>
                    {plan.key === "pro" ? (
                      <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs text-emerald-100">
                        Most popular
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span className="text-sm text-white/60">
                      {plan.cadence}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-white/70">
                    {plan.description}
                  </p>

                  <ul className="mt-6 space-y-3 text-sm text-white/80">
                    {plan.highlights.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {plan.key === "enterprise" ? (
                      <a
                        href={`mailto:${process.env.NEXT_PUBLIC_SALES_EMAIL || "sales@sellflow.ma"}`}
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm transition hover:border-white/60"
                      >
                        {plan.cta}
                      </a>
                    ) : isStarter ? (
                      <Link
                        href="/auth/signup"
                        className="inline-flex w-full items-center justify-center rounded-xl border border-white/30 px-4 py-2 text-sm transition hover:border-white/60"
                      >
                        {plan.cta}
                      </Link>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full rounded-xl bg-emerald-400 text-black hover:bg-emerald-300"
                        isLoading={isLoading}
                        onClick={() => startCheckout(plan.key)}
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/70 lg:grid-cols-3">
            <div>
              <h3 className="text-base font-semibold text-white">
                Everything secured
              </h3>
              <p className="mt-2">
                Stripe-hosted checkout, PCI compliant storage, and automated
                invoicing for every transaction.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Smart upgrades
              </h3>
              <p className="mt-2">
                Upgrade anytime. Downgrade or cancel from your billing portal in
                seconds.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Team ready</h3>
              <p className="mt-2">
                Centralize analytics and automation across every storefront with
                one plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
