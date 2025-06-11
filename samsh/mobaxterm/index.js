// blk/samsh/mobaxterm/index.js

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const inputBox = document.getElementById("inputBox");
  const outputBox = document.getElementById("outputBox");

  generateBtn.addEventListener("click", () => {
    const lines = inputBox.value.split("\n");
    const toStart = [];
    const toStop = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("*")) return; // only look at starred lines

      const parts = trimmed.split(/\s+/);
      const [act, exp] = parts[1].split("/").map((n) => parseInt(n, 10));
      const service = parts[3];
      const host = parts[4];

      if (act < exp) {
        toStart.push({ service, host });
      } else if (act > exp) {
        toStop.push({ service, host });
      }
    });

    const cmds = [];

    if (toStart.length) {
      const args = toStart.map((x) => `${x.service} ${x.host}`).join(" ");
      cmds.push(`start ${args} -r 'Instances fewer than expected'`);
    }

    if (toStop.length) {
      const args = toStop.map((x) => `${x.service} ${x.host}`).join(" ");
      cmds.push(`stop extra ${args} -r 'Instances exceed expected'`);
    }

    outputBox.value = cmds.join("\n") + "\n";
  });
});
