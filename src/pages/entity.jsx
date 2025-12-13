import React, { useMemo, useState } from "react";

const split = (v) =>
  v
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

  const { before, after, lines, delimited } = useMemo(() => {
    const items = split(input);
    let uniq = Array.from(new Set(items));
    if (sort) uniq = [...uniq].sort((a, b) => a.localeCompare(b));
    return {
      before: items.length,
      after: uniq.length,
      lines: uniq.join("\n"),
      delimited: uniq.join(delim),
    };
  }, [input, sort, delim]);

  return (
    <div className="container-fluid mt-3">
      <div className="row g-3">
        {/* INPUT */}
        <div className="col-md-6">
          <label className="form-label fw-semibold fs-5">input</label>
          <div className="d-flex align-items-center gap-2 mt-2 mb-3">
            <input
              type="checkbox"
              checked={sort}
              onChange={(e) => setSort(e.target.checked)}
            />
            <span>sort</span>
            <span className="text-muted ms-2">
              {before} → {after}
            </span>
          </div>

          <textarea
            className="form-control"
            style={{ minHeight: "500px" }}
            placeholder="enter lines..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* OUTPUT */}
        <div className="col-md-6 d-flex flex-column gap-3">
          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-semibold fs-5">non-duplicates</span>
              <button className="btn btn-sm" onClick={() => copy(lines)}>
                📋
              </button>
            </div>
            <textarea
              className="form-control bg-light"
              style={{ minHeight: "250px" }}
              readOnly
              value={lines}
            />
          </div>

          <div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="fw-semibold fs-5">
                {delim === "," ? "comma-separated" : "space-separated"}
              </span>
              <div className="d-flex gap-1">
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
                <button className="btn btn-sm" onClick={() => copy(delimited)}>
                  📋
                </button>
              </div>
            </div>
            <textarea
              className="form-control bg-light"
              style={{ minHeight: "250px" }}
              readOnly
              value={delimited}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
