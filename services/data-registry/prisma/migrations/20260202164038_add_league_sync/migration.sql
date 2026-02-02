-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastSyncAt" TIMESTAMP(3);
