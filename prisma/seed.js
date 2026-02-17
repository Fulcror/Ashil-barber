import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.bookedAppointment.deleteMany();
  console.log("🧹 Cleared existing appointments");

  // Create sample booked appointments
  const appointments = [
    {
      startDatetimeUtc: new Date("2026-02-18T05:00:00Z"), // 9:00 AM UTC+4
      endDatetimeUtc: new Date("2026-02-18T06:00:00Z"), // 10:00 AM UTC+4
      phoneNumber: "+971501234567",
      confirmationCode: "APPT001",
      status: "confirmed",
    },
    {
      startDatetimeUtc: new Date("2026-02-18T09:00:00Z"), // 1:00 PM UTC+4
      endDatetimeUtc: new Date("2026-02-18T10:00:00Z"), // 2:00 PM UTC+4
      phoneNumber: "+971507654321",
      confirmationCode: "APPT002",
      status: "confirmed",
    },
    {
      startDatetimeUtc: new Date("2026-02-19T07:00:00Z"), // 11:00 AM UTC+4
      endDatetimeUtc: new Date("2026-02-19T08:00:00Z"), // 12:00 PM UTC+4
      phoneNumber: "+971509876543",
      confirmationCode: "APPT003",
      status: "confirmed",
    },
    {
      startDatetimeUtc: new Date("2026-02-20T05:00:00Z"), // 9:00 AM UTC+4
      endDatetimeUtc: new Date("2026-02-20T06:00:00Z"), // 10:00 AM UTC+4
      phoneNumber: "+971502345678",
      confirmationCode: "APPT004",
      status: "canceled",
    },
    {
      startDatetimeUtc: new Date("2026-02-20T11:00:00Z"), // 3:00 PM UTC+4
      endDatetimeUtc: new Date("2026-02-20T12:00:00Z"), // 4:00 PM UTC+4
      phoneNumber: "+971508765432",
      confirmationCode: "APPT005",
      status: "confirmed",
    },
  ];

  for (const appointment of appointments) {
    await prisma.bookedAppointment.create({ data: appointment });
    console.log(`✅ Created appointment: ${appointment.confirmationCode}`);
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
