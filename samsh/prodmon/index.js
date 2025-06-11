// blk/samsh/prodmon/index.js

document.getElementById("generateBtn").addEventListener("click", () => {
  const input = document.getElementById("inputBox").value;
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const records = [];

  const excludeUnreachable =
    document.getElementById("excludeUnreachable").checked;

  lines.forEach((line) => {
    const parts = line.split("\t");
    if (parts.length !== 3) return;
    const [client, target, msg] = parts;

    const mismatch = msg.match(/Instance Mismatch \((\d+)\/(\d+)\)/);
    const unreachable = msg.match(/SAM is unreachable on (\S+)/);

    if (mismatch) {
      const [a, b] = [parseInt(mismatch[1]), parseInt(mismatch[2])];
      if (a !== b) {
        const action = a < b ? "start" : "stop extra";
        records.push({ client, target, action });
      }
    } else if (unreachable && !excludeUnreachable) {
      records.push({ client, target: unreachable[1], action: "agent-start" });
    }
  });

  const byClient = {};
  const byServer = {};
  const used = new Set();
  const commands = [];

  records.forEach(({ client, target, action }) => {
    const key = `${client}|${action}`;
    if (!byClient[key]) byClient[key] = new Set();
    byClient[key].add(target);

    if (action !== "agent-start") {
      const sKey = `${target}|${action}`;
      if (!byServer[sKey]) byServer[sKey] = new Set();
      byServer[sKey].add(client);
    }
  });

  const addCmd = (action, clients, targets, reason) => {
    const base = "/usr/local/bfm/etc/samsh.pl";
    if (action === "agent-start") {
      const client = clients[0];
      return `${base} ${client} -c '${action} ${targets.join(
        " "
      )} -r Starting SAM'`;
    } else {
      let payload = `${action} client=${clients.join(",")} name=${targets.join(
        ","
      )}`;
      if (reason) payload += ` -r ${reason}`;
      return `${base} -c '${payload}'`;
    }
  };

  for (const key in byClient) {
    const [client, action] = key.split("|");
    if (action === "agent-start") {
      const targets = Array.from(byClient[key]).sort();
      targets.forEach((t) => used.add(`${client}|${t}|${action}`));
      commands.push(addCmd(action, [client], targets, "Starting SAM"));
    }
  }

  for (const key in byClient) {
    const [client, action] = key.split("|");
    const targets = Array.from(byClient[key]);
    if (action !== "agent-start" && targets.length > 1) {
      targets.forEach((t) => used.add(`${client}|${t}|${action}`));
      const reason =
        action === "start"
          ? "Instances fewer than expected"
          : "Instances exceed expected";
      commands.push(addCmd(action, [client], targets.sort(), reason));
    }
  }

  for (const key in byServer) {
    const [server, action] = key.split("|");
    const clients = Array.from(byServer[key]).filter(
      (c) => !used.has(`${c}|${server}|${action}`)
    );
    if (clients.length > 1) {
      clients.forEach((c) => used.add(`${c}|${server}|${action}`));
      const reason =
        action === "start"
          ? "Instances fewer than expected"
          : "Instances exceed expected";
      commands.push(addCmd(action, clients.sort(), [server], reason));
    }
  }

  for (const key in byClient) {
    const [client, action] = key.split("|");
    for (const server of byClient[key]) {
      if (!used.has(`${client}|${server}|${action}`)) {
        const reason =
          action === "start"
            ? "Instances fewer than expected"
            : action === "stop extra"
            ? "Instances exceed expected"
            : null;
        commands.push(addCmd(action, [client], [server], reason));
      }
    }
  }

  document.getElementById("outputBox").value = commands.join("\n") + "\n";
});
