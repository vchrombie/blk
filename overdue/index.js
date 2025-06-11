// index.js

const inputBox = document.getElementById("inputBox");
const outputBox = document.getElementById("outputBox");
const generateBtn = document.getElementById("generateBtn");

generateBtn.addEventListener("click", () => {
  const lines = inputBox.value
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const commands = lines.map((line) => {
    const [service, host] = line.split(/\s+/);

    const commaParts = line.split(",");
    const bounceClause = commaParts[1] ? commaParts[1].trim() : "";

    const reason = bounceClause
      ? `Exceeded scheduled bounce time (${bounceClause})`
      : "Manual restart";

    return `restart ${service} ${host} -r "${reason}"`;
  });

  outputBox.value = commands.join("\n");
});
