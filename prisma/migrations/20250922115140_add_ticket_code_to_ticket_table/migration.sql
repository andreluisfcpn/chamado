/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "priority" SET DEFAULT 'LOW';

-- CreateIndex
CREATE UNIQUE INDEX "tickets_code_key" ON "public"."tickets"("code");
