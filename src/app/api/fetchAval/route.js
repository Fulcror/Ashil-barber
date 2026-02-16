export async function GET() {
  // Mock availability: availableDates and hours
  const today = new Date();
  const availableDates = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Block weekends, only allow Mon-Fri
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      availableDates.push(date.toISOString().split("T")[0]);
    }
  }
  // Mock available hours for each date
  const hours = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
  ];
  const availability = {};
  availableDates.forEach((date) => {
    // Randomly block some hours
    availability[date] = hours.filter(() => Math.random() > 0.3);
  });
  const mockData = {
    success: true,
    availableDates,
    availability,
    timestamp: new Date().toISOString(),
  };
  return Response.json(mockData);
}
