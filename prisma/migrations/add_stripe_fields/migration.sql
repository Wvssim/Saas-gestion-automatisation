-- AlterTable users: Add Stripe billing fields
ALTER TABLE "users" ADD COLUMN "stripeCustomerId" TEXT,
ADD COLUMN "stripeSubscriptionId" TEXT,
ADD COLUMN "subscriptionStatus" TEXT,
ADD COLUMN "subscriptionEndsAt" TIMESTAMP(3);

-- CreateIndex for quick Stripe lookups
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");
