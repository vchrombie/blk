import React, { useMemo, useState } from "react";

const MOBAX_RE = /^\*?\s*\d+\/\d+\s+CLIENT\s+(\S+)\s+(\S+)\s*(.*)$/;

const PRODMON_RE = /^(\S+)\s+(\S+)\s+Instance Mismatch\s+\((\d+)\/(\d+)\)/;

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

function parseMobaxterm(text) {
  const fewer = [];
  const excess = [];

  text.split("\n").forEach((line) => {
    const m = line.match(MOBAX_RE);
    if (!m) return;

    const name = m[1];
    const host = m[2];
    const counts = m[3].trim().split(/\s+/).filter(Boolean);

    if (counts.length === 1) {
      fewer.push(`${name} ${host}`);
    } else if (counts.length > 1) {
      excess.push(`${name} ${host}`);
    }
  });

  const out = [];
  if (fewer.length) {
    out.push(`start ${fewer.join(" ")} -r 'Instances fewer than expected'`);
  }
  if (excess.length) {
    out.push(`stop extra ${excess.join(" ")} -r 'Instances exceed expected'`);
  }
  return out;
}

function parseProdmon(text) {
  const start = {};
  const stop = {};
  const samHosts = new Set();

  text.split("\n").forEach((line) => {
    if (line.includes("SAM is unreachable")) {
      const [client, , , host] = line.split(/\s+/);
      samHosts.add(host);
      return;
    }

    const m = line.match(PRODMON_RE);
    if (!m) return;

    const client = m[1];
    const name = m[2];
    const cur = Number(m[3]);
    const exp = Number(m[4]);

    if (cur < exp) {
      start[client] = start[client] || [];
      start[client].push(name);
    } else if (cur > exp) {
      stop[client] = stop[client] || [];
      stop[client].push(name);
    }
  });

  const out = [];

  if (samHosts.size) {
    out.push(
      `/usr/local/bfm/etc/samsh.pl CLIENT4 -c 'agent-start ${[...samHosts].join(
        " "
      )} -r Starting SAM'`
    );
  }

  Object.entries(start).forEach(([c, names]) => {
    out.push(
      `/usr/local/bfm/etc/samsh.pl -c 'start client=${c} name=${names.join(
        ","
      )} -r Instances fewer than expected'`
    );
  });

  Object.entries(stop).forEach(([c, names]) => {
    out.push(
      `/usr/local/bfm/etc/samsh.pl -c 'stop extra client=${c} name=${names.join(
        ","
      )} -r Instances exceed expected'`
    );
  });

  return out;
}

export default function Samsh() {
  const [mode, setMode] = useState("mobaxterm");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    const cmds =
      mode === "mobaxterm" ? parseMobaxterm(input) : parseProdmon(input);
    return Array.from(new Set(cmds)).join("\n");
  }, [input, mode]);

  return (
    <div className="container-fluid mt-3">
      <div className="text-center mb-3">
        <div className="btn-group">
          <button
            className={`btn btn-sm ${
              mode === "mobaxterm" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setMode("mobaxterm")}
          >
            mobaxterm
          </button>
          <button
            className={`btn btn-sm ${
              mode === "prodmon" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setMode("prodmon")}
          >
            prodmon
          </button>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold fs-4">input</label>
          <textarea
            className="form-control"
            style={{ minHeight: "520px" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-semibold fs-4">output</span>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => copy(output)}
            >
              📋
            </button>
          </div>
          <textarea
            className="form-control bg-light"
            style={{ minHeight: "520px" }}
            readOnly
            value={output}
          />
        </div>
      </div>
    </div>
  );
}
