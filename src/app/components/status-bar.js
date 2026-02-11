"use client";

import { useEffect, useState } from "react";

export default function StatusBar() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const updateTime = () => {
      const mauritiusTime = new Date().toLocaleString("en-US", {
        timeZone: "Indian/Mauritius",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setTime(mauritiusTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-6 bg-white z-10 flex items-center justify-between px-4 text-xs font-semibold text-black pt-1">
      <span>{time}</span>
      <div className="flex gap-1">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>
  );
}
