-- CreateTable
CREATE TABLE "public"."_CreatedTickets" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CreatedTickets_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CreatedTickets_B_index" ON "public"."_CreatedTickets"("B");

-- AddForeignKey
ALTER TABLE "public"."_CreatedTickets" ADD CONSTRAINT "_CreatedTickets_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CreatedTickets" ADD CONSTRAINT "_CreatedTickets_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
