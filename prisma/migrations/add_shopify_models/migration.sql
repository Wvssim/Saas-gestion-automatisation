-- AlterTable: Integration - add refresh token + expiry
ALTER TABLE "integrations"
  ADD COLUMN "refreshToken" TEXT,
  ADD COLUMN "accessTokenExpiresAt" TIMESTAMP(3);

-- AlterTable: Product - add lastUpdatedAt + soft delete
ALTER TABLE "products"
  ADD COLUMN "lastUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- AlterTable: Order - add customerId
ALTER TABLE "orders"
  ADD COLUMN "customerId" TEXT;

-- CreateTable: customers
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "province" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customers_integrationId_externalId_key"
  ON "customers"("integrationId", "externalId");

-- CreateTable: line_items
CREATE TABLE "line_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "subtotal" DECIMAL(65,30) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: webhooks
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhooks_integrationId_topic_key"
  ON "webhooks"("integrationId", "topic");

-- CreateTable: webhook_logs
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: price_history
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "oldPrice" DECIMAL(65,30) NOT NULL,
    "newPrice" DECIMAL(65,30) NOT NULL,
    "changedBy" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- Foreign keys: Order -> Customer (SET NULL)
ALTER TABLE "orders"
  ADD CONSTRAINT "orders_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "customers"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys: Customer -> Integration (CASCADE)
ALTER TABLE "customers"
  ADD CONSTRAINT "customers_integrationId_fkey"
  FOREIGN KEY ("integrationId") REFERENCES "integrations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: LineItem -> Order, Product (CASCADE)
ALTER TABLE "line_items"
  ADD CONSTRAINT "line_items_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "orders"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "line_items"
  ADD CONSTRAINT "line_items_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: Webhook -> Integration (CASCADE)
ALTER TABLE "webhooks"
  ADD CONSTRAINT "webhooks_integrationId_fkey"
  FOREIGN KEY ("integrationId") REFERENCES "integrations"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: WebhookLog -> Webhook (CASCADE)
ALTER TABLE "webhook_logs"
  ADD CONSTRAINT "webhook_logs_webhookId_fkey"
  FOREIGN KEY ("webhookId") REFERENCES "webhooks"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys: PriceHistory -> Product (CASCADE)
ALTER TABLE "price_history"
  ADD CONSTRAINT "price_history_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Helpful indexes
CREATE INDEX "customers_integrationId_idx" ON "customers"("integrationId");
CREATE INDEX "line_items_orderId_idx" ON "line_items"("orderId");
CREATE INDEX "line_items_productId_idx" ON "line_items"("productId");
CREATE INDEX "webhooks_integrationId_idx" ON "webhooks"("integrationId");
CREATE INDEX "webhook_logs_webhookId_idx" ON "webhook_logs"("webhookId");
CREATE INDEX "price_history_productId_idx" ON "price_history"("productId");
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");
CREATE INDEX "products_deletedAt_idx" ON "products"("deletedAt");
