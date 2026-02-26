/*
  Warnings:

  - Added the required column `title` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."tickets" ADD COLUMN     "title" TEXT NOT NULL;
