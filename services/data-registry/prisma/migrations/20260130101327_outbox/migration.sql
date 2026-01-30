-- AlterTable
ALTER TABLE "Outbox" ADD COLUMN     "retries" INTEGER NOT NULL DEFAULT 0;
