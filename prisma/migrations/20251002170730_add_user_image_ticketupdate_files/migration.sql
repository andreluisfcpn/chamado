/*
  Warnings:

  - You are about to drop the `_CreatedTickets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `image` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."_CreatedTickets" DROP CONSTRAINT "_CreatedTickets_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CreatedTickets" DROP CONSTRAINT "_CreatedTickets_B_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."_CreatedTickets";

-- CreateTable
CREATE TABLE "ticket_updates_files" (
    "id" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "ticketUpdateId" TEXT NOT NULL,

    CONSTRAINT "ticket_updates_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ticket_updates_files" ADD CONSTRAINT "ticket_updates_files_ticketUpdateId_fkey" FOREIGN KEY ("ticketUpdateId") REFERENCES "ticket_updates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
