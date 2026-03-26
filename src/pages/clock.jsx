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

function getNextSecondDelay() {
  const now = Date.now();
  return 1000 - (now % 1000);
}

function getDayPhase(dateTime) {
  const hour = dateTime.hour;

  if (hour >= 5 && hour < 12) {
    return { emoji: "🌤️", label: "Morning" };
  }

  if (hour >= 12 && hour < 18) {
    return { emoji: "☀️", label: "Afternoon" };
  }

  if (hour >= 18 && hour < 22) {
    return { emoji: "🌆", label: "Evening" };
  }

  return { emoji: "🌙", label: "Night" };
}

function getNowState(nextSourceKey) {
  const nowUtc = DateTime.utc().set({ millisecond: 0 });
  const source = ZONES.find(({ key }) => key === nextSourceKey) ?? ZONES[0];
  const sourceDateTime = nowUtc.setZone(source.zone);

  return {
    utcTime: nowUtc,
    dateDraft: sourceDateTime.toFormat("yyyy-LL-dd"),
    timeDraft: sourceDateTime.toFormat("HH:mm"),
  };
}

export default function Clock() {
  const initialState = getNowState("DEL");
  const [sourceKey, setSourceKey] = useState("DEL");
  const [utcTime, setUtcTime] = useState(initialState.utcTime);
  const [clockUtc, setClockUtc] = useState(() => DateTime.utc());
  const [dateDraft, setDateDraft] = useState(initialState.dateDraft);
  const [timeDraft, setTimeDraft] = useState(initialState.timeDraft);
  const debounceRef = useRef();

  useEffect(() => {
    let timeoutId;
    let intervalId;

    const startTicking = () => {
      setClockUtc(DateTime.utc());
      intervalId = window.setInterval(() => {
        setClockUtc(DateTime.utc());
      }, 1000);
    };

    setClockUtc(DateTime.utc());
    timeoutId = window.setTimeout(startTicking, getNextSecondDelay());

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(debounceRef.current);
    };
  }, []);

  const sourceZone =
    ZONES.find(({ key }) => key === sourceKey)?.zone ?? ZONES[0].zone;

  const applyDrafts = (
    nextDateDraft,
    nextTimeDraft,
    nextSourceKey = sourceKey,
  ) => {
    const parsedTime = parseTime(nextTimeDraft);
    if (!parsedTime || !nextDateDraft) return false;

    const sourceZoneName =
      ZONES.find(({ key }) => key === nextSourceKey)?.zone ?? ZONES[0].zone;
    const nextDateTime = DateTime.fromFormat(
      `${nextDateDraft} ${parsedTime.hour}:${parsedTime.minute}`,
      "yyyy-LL-dd H:m",
      { zone: sourceZoneName },
    );

    if (!nextDateTime.isValid) return false;

    setUtcTime(nextDateTime.toUTC().set({ second: 0, millisecond: 0 }));
    return true;
  };

  const handleSourceChange = (nextSourceKey) => {
    window.clearTimeout(debounceRef.current);
    const sourceDateTime = utcTime.setZone(sourceZone);
    const nextSourceTime = sourceDateTime.setZone(
      ZONES.find(({ key }) => key === nextSourceKey)?.zone ?? ZONES[0].zone,
    );

    setSourceKey(nextSourceKey);
    setDateDraft(nextSourceTime.toFormat("yyyy-LL-dd"));
    setTimeDraft(nextSourceTime.toFormat("HH:mm"));
  };

  const handleDateChange = (value) => {
    setDateDraft(value);
    if (applyDrafts(value, timeDraft)) return;

    if (!value) return;
    const resetState = getNowState(sourceKey);
    setUtcTime(resetState.utcTime);
    setDateDraft(resetState.dateDraft);
    setTimeDraft(resetState.timeDraft);
  };

  const handleTimeChange = (value) => {
    const formattedValue = formatInputValue(value);
    window.clearTimeout(debounceRef.current);
    setTimeDraft(formattedValue);

    const parsed = parseTime(formattedValue);
    if (!parsed || !dateDraft) return;

    debounceRef.current = window.setTimeout(() => {
      applyDrafts(dateDraft, formattedValue);
    }, 300);
  };

  const handleTimeBlur = () => {
    window.clearTimeout(debounceRef.current);
    if (applyDrafts(dateDraft, timeDraft)) {
      setTimeDraft(formatInputValue(timeDraft));
      return;
    }

    const resetState = getNowState(sourceKey);
    setUtcTime(resetState.utcTime);
    setDateDraft(resetState.dateDraft);
    setTimeDraft(resetState.timeDraft);
  };

  const handleRefresh = () => {
    window.clearTimeout(debounceRef.current);
    const resetState = getNowState(sourceKey);
    setUtcTime(resetState.utcTime);
    setClockUtc(resetState.utcTime);
    setDateDraft(resetState.dateDraft);
    setTimeDraft(resetState.timeDraft);
  };

  const cards = useMemo(() => {
    return ZONES.map(({ key, label, zone }) => ({
      key,
      label,
      converted: utcTime.setZone(zone),
      live: clockUtc.setZone(zone),
    }));
  }, [clockUtc, utcTime]);

  return (
    <section className="clock-page">
      <section className="clock-section">
        <div className="clock-section-head">
          <h2 className="clock-section-title">Live Clocks</h2>
        </div>
        <div className="clock-grid" role="group" aria-label="Live clocks">
          {cards.map(({ key, label, live }) => {
            const dayPhase = getDayPhase(live);

            return (
              <article key={key} className="clock-card">
                <div className="clock-label-row">
                  <label className="clock-label">{label}</label>
                  <span
                    className="clock-label-emoji"
                    aria-label={dayPhase.label}
                    title={dayPhase.label}
                  >
                    {dayPhase.emoji}
                  </span>
                </div>
                <div className="clock-visual clock-visual-top">
                  <AnalogClock dateTime={live} label={label} />
                </div>
                <div className="clock-live-datetime">
                  {live.toFormat("HH:mm:ss dd LLL yyyy")}
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <section className="clock-section">
        <div className="clock-section-head">
          <h2 className="clock-section-title">Timezone Converter</h2>
        </div>
        <div className="clock-toolbar">
          <div
            className="clock-source-picker"
            role="tablist"
            aria-label="Source timezone"
          >
            {ZONES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`clock-source-btn ${sourceKey === key ? "is-active" : ""}`}
                onClick={() => handleSourceChange(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="clock-toolbar-fields">
            <label className="clock-toolbar-field">
              <span className="clock-toolbar-label">Date</span>
              <input
                className="clock-toolbar-input clock-date-input"
                type="date"
                value={dateDraft}
                onChange={(event) => handleDateChange(event.target.value)}
              />
            </label>
            <label className="clock-toolbar-field">
              <span className="clock-toolbar-label">Time</span>
              <input
                className="clock-toolbar-input clock-time-input"
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="HH:mm"
                value={timeDraft}
                onChange={(event) => handleTimeChange(event.target.value)}
                onBlur={handleTimeBlur}
              />
            </label>
            <button
              className="clock-refresh"
              type="button"
              onClick={handleRefresh}
            >
              Now
            </button>
          </div>
        </div>
        <div
          className="clock-grid clock-grid-converter"
          role="group"
          aria-label="Timezone converter"
        >
          {cards.map(({ key, label, converted }) => {
            const isSource = sourceKey === key;

            return (
              <article key={key} className="clock-card clock-card-converter">
                <div className="clock-label-row">
                  <label className="clock-label">{label}</label>
                  {isSource ? (
                    <span className="clock-badge">Source</span>
                  ) : null}
                </div>
                <div className="clock-converter-output" aria-live="polite">
                  {converted.toFormat("HH:mm:ss dd LLL yyyy")}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
