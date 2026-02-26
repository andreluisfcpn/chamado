-- CreateEnum
CREATE TYPE "SLAStatus" AS ENUM ('WITHIN_DEADLINE', 'NEARING_DEADLINE', 'BREACHED');

-- AlterTable
ALTER TABLE "ticket_types" ADD COLUMN     "slaResponseTime" INTEGER,
ADD COLUMN     "slaSolutionTime" INTEGER;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "slaResponseDeadline" TIMESTAMP(3),
ADD COLUMN     "slaSolutionDeadline" TIMESTAMP(3),
ADD COLUMN     "slaStatus" "SLAStatus";
