import React, { useMemo, useState } from "react";

function buildLineDiff(before, after) {
  const a = before.split("\n");
  const b = after.split("\n");
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      diff.push({ type: "equal", line: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: "remove", line: a[i] });
      i += 1;
    } else {
      diff.push({ type: "add", line: b[j] });
      j += 1;
    }
  }

  while (i < n) {
    diff.push({ type: "remove", line: a[i] });
    i += 1;
  }

  while (j < m) {
    diff.push({ type: "add", line: b[j] });
    j += 1;
  }

  return diff;
}

function buildCharDiff(before, after) {
  const a = Array.from(before);
  const b = Array.from(after);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      diff.push({ type: "equal", char: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: "remove", char: a[i] });
      i += 1;
    } else {
      diff.push({ type: "add", char: b[j] });
      j += 1;
    }
  }

  while (i < n) {
    diff.push({ type: "remove", char: a[i] });
    i += 1;
  }

  while (j < m) {
    diff.push({ type: "add", char: b[j] });
    j += 1;
  }

  return diff;
}

function tokenizeWords(line) {
  const tokens = line.match(/(\s+|[A-Za-z0-9_]+|[^\sA-Za-z0-9_])/g);
  return tokens ? tokens : [];
}

function buildWordDiff(beforeLine, afterLine) {
  const a = tokenizeWords(beforeLine);
  const b = tokenizeWords(afterLine);
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const diff = [];
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (a[i] === b[j]) {
      diff.push({ type: "equal", text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      diff.push({ type: "remove", text: a[i] });
      i += 1;
    } else {
      diff.push({ type: "add", text: b[j] });
      j += 1;
    }
  }

  while (i < n) {
    diff.push({ type: "remove", text: a[i] });
    i += 1;
  }

  while (j < m) {
    diff.push({ type: "add", text: b[j] });
    j += 1;
  }

  const removed = [];
  const added = [];

  diff.forEach((token) => {
    if (token.type === "equal") {
      removed.push(token);
      added.push(token);
      return;
    }
    if (token.type === "remove") {
      removed.push(token);
      return;
    }
    if (token.type === "add") {
      added.push(token);
    }
  });

  return { removed, added };
}

function buildUnifiedRows(lineDiff) {
  const rows = [];

  for (let i = 0; i < lineDiff.length; i += 1) {
    const entry = lineDiff[i];
    const next = lineDiff[i + 1];

    if (entry.type === "remove" && next && next.type === "add") {
      const words = buildWordDiff(entry.line, next.line);
      rows.push({
        type: "remove",
        prefix: "-",
        tokens: words.removed,
      });
      rows.push({
        type: "add",
        prefix: "+",
        tokens: words.added,
      });
      i += 1;
      continue;
    }

    if (entry.type === "remove") {
      rows.push({
        type: "remove",
        prefix: "-",
        tokens: [{ type: "remove", text: entry.line }],
      });
      continue;
    }

    if (entry.type === "add") {
      rows.push({
        type: "add",
        prefix: "+",
        tokens: [{ type: "add", text: entry.line }],
      });
      continue;
    }

    rows.push({
      type: "equal",
      prefix: " ",
      tokens: [{ type: "equal", text: entry.line }],
    });
  }

  return rows;
}

function buildSplitRows(lineDiff) {
  const left = [];
  const right = [];

  for (let i = 0; i < lineDiff.length; i += 1) {
    const entry = lineDiff[i];
    const next = lineDiff[i + 1];

    if (entry.type === "remove" && next && next.type === "add") {
      const words = buildWordDiff(entry.line, next.line);
      left.push({
        type: "remove",
        prefix: "-",
        tokens: words.removed,
      });
      right.push({
        type: "add",
        prefix: "+",
        tokens: words.added,
      });
      i += 1;
      continue;
    }

    if (entry.type === "remove") {
      left.push({
        type: "remove",
        prefix: "-",
        tokens: [{ type: "remove", text: entry.line }],
      });
      right.push({
        type: "empty",
        prefix: " ",
        tokens: [],
      });
      continue;
    }

    if (entry.type === "add") {
      left.push({
        type: "empty",
        prefix: " ",
        tokens: [],
      });
      right.push({
        type: "add",
        prefix: "+",
        tokens: [{ type: "add", text: entry.line }],
      });
      continue;
    }

    left.push({
      type: "equal",
      prefix: " ",
      tokens: [{ type: "equal", text: entry.line }],
    });
    right.push({
      type: "equal",
      prefix: " ",
      tokens: [{ type: "equal", text: entry.line }],
    });
  }

  return { left, right };
}

function renderTokens(tokens) {
  if (!tokens.length) return <span className="diff-empty"> </span>;

  return tokens.map((token, idx) => {
    if (token.type === "add") {
      return (
        <span key={`add-${idx}`} className="diff-word-add">
          {token.text}
        </span>
      );
    }
    if (token.type === "remove") {
      return (
        <span key={`remove-${idx}`} className="diff-word-remove">
          {token.text}
        </span>
      );
    }
    return <span key={`eq-${idx}`}>{token.text}</span>;
  });
}

export default function Diff() {
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [mode, setMode] = useState("split");

  const { lineDiff, addedLines, removedLines, addedChars, removedChars } =
    useMemo(() => {
      const computedLines = buildLineDiff(before, after);
      const computedChars = buildCharDiff(before, after);
      let added = 0;
      let removed = 0;
      let addedCharCount = 0;
      let removedCharCount = 0;

      computedLines.forEach((entry) => {
        if (entry.type === "add") {
          added += 1;
        } else if (entry.type === "remove") {
          removed += 1;
        }
      });

      computedChars.forEach((entry) => {
        if (entry.type === "add") {
          addedCharCount += 1;
        } else if (entry.type === "remove") {
          removedCharCount += 1;
        }
      });

      return {
        lineDiff: computedLines,
        addedLines: added,
        removedLines: removed,
        addedChars: addedCharCount,
        removedChars: removedCharCount,
      };
    }, [before, after]);

  const unifiedRows = buildUnifiedRows(lineDiff);
  const splitRows = buildSplitRows(lineDiff);

  const inlineView = (
    <div className="diff-output diff-unified">
      {unifiedRows.map((row, idx) => (
        <div key={`${row.type}-${idx}`} className={`diff-row diff-${row.type}`}>
          <span className="diff-prefix">{row.prefix}</span>
          <span className="diff-content">{renderTokens(row.tokens)}</span>
        </div>
      ))}
    </div>
  );

  const sideBySideView = (
    <div className="diff-grid">
      <div className="diff-output diff-unified">
        {splitRows.left.map((row, idx) => (
          <div
            key={`left-${row.type}-${idx}`}
            className={`diff-row diff-${row.type}`}
          >
            <span className="diff-prefix">{row.prefix}</span>
            <span className="diff-content">{renderTokens(row.tokens)}</span>
          </div>
        ))}
      </div>
      <div className="diff-output diff-unified">
        {splitRows.right.map((row, idx) => (
          <div
            key={`right-${row.type}-${idx}`}
            className={`diff-row diff-${row.type}`}
          >
            <span className="diff-prefix">{row.prefix}</span>
            <span className="diff-content">{renderTokens(row.tokens)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() =>
            setMode((prev) => (prev === "inline" ? "split" : "inline"))
          }
        >
          {mode === "inline" ? "side-by-side" : "inline"}
        </button>
        <span className="ms-auto fw-semibold">
          chars -{removedChars} / +{addedChars} · lines -{removedLines} / +
          {addedLines}
        </span>
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label fw-semibold fs-4">input</label>
          <textarea
            className="form-control"
            placeholder="paste original content ..."
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            style={{ minHeight: "260px" }}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label fw-semibold fs-4">output</label>
          <textarea
            className="form-control"
            placeholder="paste new content ..."
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            style={{ minHeight: "260px" }}
          />
        </div>
      </div>

      <div className="mt-3">
        {mode === "inline" ? inlineView : sideBySideView}
      </div>
    </div>
  );
}
