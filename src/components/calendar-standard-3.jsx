"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

export const title = "Calendar as Appointment Picker";

const Example = () => {
  const timeZone = "Asia/Dubai"; // UTC+4
  const [date, setDate] = useState(() => {
    // Initialize with today's date in UTC+4
    return toZonedTime(new Date(), timeZone);
  });
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availability, setAvailability] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/calendar");
        const data = await response.json();
        setAvailableDates(data.availableDates || []);
        setAvailability(data.availability || {});
        
        // Set initial times for the selected date
        if (date) {
          const isoDate = format(date, "yyyy-MM-dd");
          setAvailableTimes(data.availability[isoDate] || []);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  const handleDateSelect = (newDate) => {
    setDate(newDate);
    setSelectedTime(null);
    
    // Fetch times for the selected date
    const isoDate = format(newDate, "yyyy-MM-dd");
    setAvailableTimes(availability[isoDate] || []);
  };

  const isDateAvailable = (testDate) => {
    const isoDate = format(testDate, "yyyy-MM-dd");
    return availableDates.includes(isoDate);
  };

  return (
    <div className="flex flex-col md:flex-row md:divide-x overflow-hidden rounded-md border bg-background">
      <div className="flex justify-center items-center p-4">
        <Calendar 
          mode="single" 
          onSelect={handleDateSelect} 
          selected={date}
          disabled={(testDate) => !isDateAvailable(testDate)}
        />
      </div>
      <div className="w-full md:w-[249px] border-t md:border-t-0">
        <div className="space-y-2 px-4 pt-4">
          <p className="text-center text-sm font-medium">Available Times</p>
        </div>
        <ScrollArea className="h-[300px] md:h-full">
          {loading ? (
            <p className="px-4 py-2 text-sm text-gray-500">Loading...</p>
          ) : availableTimes.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 px-4 pb-4">
              {availableTimes.map((slot) => (
                <Button
                  key={slot.time}
                  onClick={() => slot.status === "available" && setSelectedTime(slot.time)}
                  size="sm"
                  variant={
                    slot.status === "booked" 
                      ? "secondary" 
                      : selectedTime === slot.time 
                      ? "default" 
                      : "outline"
                  }
                  disabled={slot.status === "booked"}
                  className={slot.status === "booked" ? "cursor-not-allowed opacity-60" : ""}
                >
                  {slot.time} {slot.status === "booked" && "(Booked)"}
                </Button>
              ))}
            </div>
          ) : (
            <p className="px-4 py-2 text-sm text-gray-500">No times available</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Example;
