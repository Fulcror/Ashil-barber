/*
  Warnings:

  - A unique constraint covering the columns `[startDatetimeUtc,status]` on the table `booked_appointments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "booked_appointments" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "booked_appointments_startDatetimeUtc_status_idx" ON "booked_appointments"("startDatetimeUtc", "status");

-- CreateIndex
CREATE UNIQUE INDEX "booked_appointments_startDatetimeUtc_status_key" ON "booked_appointments"("startDatetimeUtc", "status");
