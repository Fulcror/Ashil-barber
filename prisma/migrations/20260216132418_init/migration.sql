-- CreateTable
CREATE TABLE "availability_ranges" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "availability_ranges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booked_appointments" (
    "id" SERIAL NOT NULL,
    "startDatetimeUtc" TIMESTAMP(3) NOT NULL,
    "endDatetimeUtc" TIMESTAMP(3) NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "confirmationCode" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booked_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "booked_appointments_confirmationCode_key" ON "booked_appointments"("confirmationCode");
