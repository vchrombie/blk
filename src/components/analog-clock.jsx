import React from "react";

function polarToPoint(angle, length) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 50 + Math.cos(radians) * length,
    y: 50 + Math.sin(radians) * length,
  };
}

export default function AnalogClock({ dateTime, label }) {
  const minuteAngle = dateTime.minute * 6;
  const hourAngle = ((dateTime.hour % 12) + dateTime.minute / 60) * 30;
  const minuteHand = polarToPoint(minuteAngle, 28);
  const hourHand = polarToPoint(hourAngle, 20);

  return (
    <div className="clock-face" aria-label={`${label} analog clock`}>
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <circle cx="50" cy="50" r="42" className="clock-ring" />
        <line x1="50" y1="50" x2={hourHand.x} y2={hourHand.y} className="clock-hand hour" />
        <line
          x1="50"
          y1="50"
          x2={minuteHand.x}
          y2={minuteHand.y}
          className="clock-hand minute"
        />
        <circle cx="50" cy="50" r="2.5" className="clock-center" />
      </svg>
    </div>
  );
}
