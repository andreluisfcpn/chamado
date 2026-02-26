-- CreateEnum
CREATE TYPE "public"."CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."companies" ADD COLUMN     "status" "public"."CompanyStatus" NOT NULL DEFAULT 'ACTIVE';
