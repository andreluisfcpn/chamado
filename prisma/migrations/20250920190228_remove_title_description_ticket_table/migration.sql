/*
  Warnings:

  - You are about to drop the column `description` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tickets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."tickets" DROP COLUMN "description",
DROP COLUMN "title";
