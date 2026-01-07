import React, { useMemo, useState } from "react";

const split = (v, snow) =>
  snow
    ? v
        .split(", ")
        .map((s) => s.trim())
        .filter(Boolean)
    : v
        .split(/[\n,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
  }
}

export default function Entity() {
  const [input, setInput] = useState("");
  const [sort, setSort] = useState(false);
  const [delim, setDelim] = useState(",");
  const [quote, setQuote] = useState("");

  const { before, after, lines, delimited } = useMemo(() => {
    const items = split(input);
    let uniq = Array.from(new Set(items));
    if (sort) uniq = [...uniq].sort((a, b) => a.localeCompare(b));
    const formatted = quote
      ? uniq.map((item) => `${quote}${item}${quote}`)
      : uniq;
    return {
      before: items.length,
      after: uniq.length,
      lines: uniq.join("\n"),
      delimited: formatted.join(delim),
    };
  }, [input, sort, delim, quote]);

  return (
    <div className="container-fluid mt-3">
      <div className="row g-3">
        {/* INPUT */}
        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex gap-3 align-items-center">
              <label className="form-label fw-semibold fs-4">input</label>

              <button
                className={`btn btn-sm ${
                  sort ? "btn-secondary" : "btn-outline-secondary"
                }`}
                onClick={() => setSort(!sort)}
              >
                sort
              </button>

              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput("")}
              >
                clear
              </button>
            </div>
            <div className="ms-auto">
              <span className="fw-semibold">
                {before} → {after}
              </span>
            </div>
          </div>
          <textarea
            className="form-control"
            style={{ minHeight: "600px" }}
            placeholder="enter lines ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* OUTPUT */}
        <div className="col-md-6 d-flex flex-column gap-3">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex gap-3 align-items-center">
                <span className="fw-semibold fs-4">non-duplicates</span>
                <button
                  className="btn btn-sm btn-outline-secondary "
                  onClick={() => copy(lines)}
                >
                  copy
                </button>
              </div>
            </div>
            <textarea
              className="form-control bg-light"
              style={{ minHeight: "275px" }}
              readOnly
              value={lines}
            />
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex gap-4 align-items-center">
                <span className="fw-semibold fs-4">
                  {delim === "," ? "comma-separated" : "space-separated"}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => copy(delimited)}
                >
                  copy
                </button>
              </div>
              <div className="d-flex gap-2">
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${
                      delim === "," ? "btn-secondary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setDelim(",")}
                  >
                    comma
                  </button>
                  <button
                    className={`btn btn-sm ${
                      delim === " " ? "btn-secondary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setDelim(" ")}
                  >
                    space
                  </button>
                </div>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${
                      quote === "'" ? "btn-secondary" : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      setQuote((prev) => (prev === "'" ? "" : "'"))
                    }
                  >
                    single quotes
                  </button>
                  <button
                    className={`btn btn-sm ${
                      quote === '"' ? "btn-secondary" : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      setQuote((prev) => (prev === '"' ? "" : '"'))
                    }
                  >
                    double quotes
                  </button>
                </div>
              </div>
            </div>
            <textarea
              className="form-control bg-light"
              style={{ minHeight: "275px" }}
              readOnly
              value={delimited}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
