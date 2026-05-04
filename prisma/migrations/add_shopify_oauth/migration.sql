-- CreateTable oauth_states
CREATE TABLE "oauth_states" (
    "id" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "store_url" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for unique state
CREATE UNIQUE INDEX "oauth_states_state_key" ON "oauth_states"("state");

-- CreateIndex for cleanup (TTL query)
CREATE INDEX "oauth_states_expires_at_idx" ON "oauth_states"("expires_at");
CREATE INDEX "oauth_states_user_id_idx" ON "oauth_states"("user_id");
