-- CreateTable
CREATE TABLE "public"."Analytics" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "referrer" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Analytics_cardId_idx" ON "public"."Analytics"("cardId");

-- CreateIndex
CREATE INDEX "Analytics_eventType_idx" ON "public"."Analytics"("eventType");

-- CreateIndex
CREATE INDEX "Analytics_createdAt_idx" ON "public"."Analytics"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Analytics" ADD CONSTRAINT "Analytics_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
