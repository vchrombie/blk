import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateTime } from "luxon";
import AnalogClock from "../components/analog-clock.jsx";

const ZONES = [
  { key: "DEL", label: "DEL", zone: "America/New_York" },
  { key: "SNG", label: "SNG", zone: "Asia/Singapore" },
  { key: "IND", label: "IND", zone: "Asia/Kolkata" },
  { key: "EDI", label: "EDI", zone: "Europe/London" },
];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

function formatInputValue(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseTime(value) {
  const match = formatInputValue(value).match(TIME_RE);
  if (!match) return null;

  return {
    hour: Number.parseInt(match[1], 10),
    minute: Number.parseInt(match[2], 10),
  };
}

function getDayDifferenceLabel(base, candidate) {
  const diffDays = Math.round(
    candidate.startOf("day").diff(base.startOf("day"), "days").days,
  );

  if (diffDays === 1) return "+1 day";
  if (diffDays === -1) return "-1 day";
  return "";
}

function getNextMinuteDelay() {
  const now = Date.now();
  return 60000 - (now % 60000);
}

function getDayPhase(dateTime) {
  const hour = dateTime.hour;

  if (hour >= 5 && hour < 12) {
    return { emoji: "🌤️", label: "Morning" };
  }

  if (hour >= 12 && hour < 18) {
    return { emoji: "☀️", label: "Day" };
  }

  if (hour >= 18 && hour < 22) {
    return { emoji: "🌆", label: "Evening" };
  }

  return { emoji: "🌙", label: "Night" };
}

export default function Clock() {
  const [utcTime, setUtcTime] = useState(() =>
    DateTime.utc().startOf("minute"),
  );
  const [clockUtc, setClockUtc] = useState(() => DateTime.utc());
  const [activeKey, setActiveKey] = useState(null);
  const [sourceKey, setSourceKey] = useState("DEL");
  const [drafts, setDrafts] = useState({});
  const debounceRef = useRef();

  useEffect(() => {
    if (activeKey) return undefined;

    let timeoutId;
    let intervalId;

    const startTicking = () => {
      setClockUtc(DateTime.utc());
      intervalId = window.setInterval(() => {
        setClockUtc(DateTime.utc());
      }, 60000);
    };

    setClockUtc(DateTime.utc());
    timeoutId = window.setTimeout(startTicking, getNextMinuteDelay());

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [activeKey]);

  const displayedTimes = useMemo(() => {
    return Object.fromEntries(
      ZONES.map(({ key, zone }) => [
        key,
        utcTime.setZone(zone).toFormat("HH:mm"),
      ]),
    );
  }, [utcTime]);

  const sourceDateTime = useMemo(() => {
    const sourceZone =
      ZONES.find(({ key }) => key === sourceKey)?.zone ?? ZONES[0].zone;
    return utcTime.setZone(sourceZone);
  }, [sourceKey, utcTime]);

  const handleInputChange = (key, value) => {
    const formattedValue = formatInputValue(value);

    window.clearTimeout(debounceRef.current);
    setActiveKey(key);
    setDrafts((current) => ({ ...current, [key]: formattedValue }));

    const parsed = parseTime(formattedValue);
    if (!parsed) return;

    debounceRef.current = window.setTimeout(() => {
      const zone = ZONES.find((entry) => entry.key === key)?.zone;
      if (!zone) return;

      setUtcTime((currentUtc) => {
        const zoned = currentUtc.setZone(zone).set({
          hour: parsed.hour,
          minute: parsed.minute,
          second: 0,
          millisecond: 0,
        });
        return zoned.toUTC();
      });
      setSourceKey(key);
    }, 300);
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceRef.current);
    };
  }, []);

  const handleFocus = (key) => {
    setActiveKey(key);
    setDrafts((current) => ({ ...current, [key]: displayedTimes[key] }));
  };

  const handleBlur = () => {
    window.clearTimeout(debounceRef.current);
    if (activeKey && !parseTime(drafts[activeKey] ?? "")) {
      setUtcTime(DateTime.utc().startOf("minute"));
      setSourceKey(activeKey);
    }
    setActiveKey(null);
    setDrafts({});
  };

  return (
    <section className="clock-page">
      <div className="clock-grid" role="group" aria-label="Timezone converter">
        {ZONES.map(({ key, label, zone }) => {
          const timeInZone = utcTime.setZone(zone);
          const clockInZone = clockUtc.setZone(zone);
          const dayDifference = getDayDifferenceLabel(
            sourceDateTime,
            timeInZone,
          );
          const dayPhase = getDayPhase(clockInZone);

          return (
            <article key={key} className="clock-card">
              <label className="clock-label" htmlFor={`time-${key}`}>
                {label}
              </label>
              <input
                id={`time-${key}`}
                className={`clock-input ${activeKey === key ? "is-active" : ""}`}
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="HH:mm"
                value={
                  activeKey === key
                    ? (drafts[key] ?? displayedTimes[key])
                    : displayedTimes[key]
                }
                onFocus={() => handleFocus(key)}
                onBlur={handleBlur}
                onChange={(event) => handleInputChange(key, event.target.value)}
                aria-label={`${label} time in 24-hour format`}
              />
              <div className="clock-meta" aria-live="polite">
                {dayDifference || "\u00A0"}
              </div>
              <div className="clock-visual">
                <AnalogClock dateTime={clockInZone} label={label} />
                <div
                  className="clock-phase"
                  aria-label={`${dayPhase.label} in ${label}`}
                >
                  <span className="clock-phase-emoji" aria-hidden="true">
                    {dayPhase.emoji}
                  </span>
                  <span>{dayPhase.label}</span>
                </div>
              </div>
              <div className="clock-date">
                {clockInZone.toFormat("dd LLL yyyy")}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
