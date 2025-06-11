// blk/overdue/index.js

function processLines() {
  const input = document.getElementById("inputBox").value.trim();

  let lines = input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let commands = [];

  commands = lines.map((line) => {
    const [service, host] = line.split(/\s+/);

    const [, rawClause] = line.split(",");
    const bounceClause = rawClause ? rawClause.trim() : "";

    const reason = bounceClause
      ? `Exceeded scheduled bounce time (${bounceClause})`
      : "Manual restart";

    return `restart ${service} ${host} -r "${reason}"`;
  });

  document.getElementById("outputBox").value = commands.join("\n") + "\n";
}
