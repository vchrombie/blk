import React, { useMemo, useState } from "react";

const LINE_RE = /(\S+)\s+(\S+).*should have bounced by\s+(.+)$/i;

const extract = (text) => {
  const lines = text.split("\n");
  const cmds = [];

  for (const line of lines) {
    const m = line.match(LINE_RE);
    if (!m) continue;

    const appserver = m[1];
    const hostname = m[2];
    const reason = m[3];

    cmds.push(
      `restart ${appserver} ${hostname} -r "should have bounced by ${reason}"`
    );
  }

  return Array.from(new Set(cmds)); // de-duplicate
};

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

export default function Overdue() {
  const [input, setInput] = useState("");

  const commands = useMemo(() => extract(input), [input]);

  return (
    <div className="container-fluid mt-3">
      <div className="row g-3">
        {/* INPUT */}
        <div className="col-md-6">
          <div className="d-flex gap-3 align-items-center">
            <label className="form-label fw-semibold fs-4">alerts</label>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setInput("")}
            >
              clear
            </button>
          </div>
          <textarea
            className="form-control"
            style={{ minHeight: "500px" }}
            placeholder="paste overdue alerts ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        {/* OUTPUT */}
        <div className="col-md-6">
          <div className="d-flex gap-3 align-items-center">
            <label className="form-label fw-semibold fs-4">
              restart commands
            </label>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => copy(commands.join("\n"))}
            >
              copy
            </button>
          </div>
          <textarea
            className="form-control bg-light"
            style={{ minHeight: "500px" }}
            readOnly
            value={commands.join("\n")}
          />
        </div>
      </div>
    </div>
  );
}
