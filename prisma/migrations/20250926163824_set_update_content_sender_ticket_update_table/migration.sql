/*
  Warnings:

  - You are about to drop the column `authorId` on the `ticket_updates` table. All the data in the column will be lost.
  - The required column `senderId` was added to the `ticket_updates` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."ticket_updates" DROP COLUMN "authorId",
ADD COLUMN     "senderId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ticket_updates" ADD CONSTRAINT "ticket_updates_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
