/*
  Warnings:

  - The `status` column on the `companies` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."companies" DROP COLUMN "status",
ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "status" "public"."Status" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "public"."CompanyStatus";
