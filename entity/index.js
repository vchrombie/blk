function processLines() {
  const input = document.getElementById("inputLines").value.trim();
  const shouldSort = document.getElementById("sortCheckbox").checked;

  let lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  let uniqueLines = Array.from(new Set(lines));

  if (shouldSort) {
    uniqueLines.sort();
  }

  document.getElementById("outputLines").value = uniqueLines.join("\n") + "\n";
  document.getElementById("outputComma").value = uniqueLines.join(",");
  document.getElementById("outputSpace").value = uniqueLines.join(" ");
}

function copyToClipboard(id) {
  const textarea = document.getElementById(id);
  textarea.select();
  textarea.setSelectionRange(0, 99999); // for mobile

  try {
    document.execCommand("copy");
  } catch (err) {
    alert("copy failed!");
  }
}
