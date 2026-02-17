-- This migration exists in DB history, recreating locally for drift resolution
ALTER TABLE "booked_appointments" ADD COLUMN "customerName" TEXT NOT NULL;
