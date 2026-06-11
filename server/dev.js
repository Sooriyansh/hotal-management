import { spawn } from "node:child_process";

const commands = [
  { name: "api", command: "node", args: ["server/index.js"] },
  { name: "vite", command: "npx", args: ["vite", "--host", "0.0.0.0"] }
];

const children = commands.map(({ name, command, args }) => {
  const child = spawn(command, args, {
    stdio: "pipe",
    shell: true,
    env: process.env
  });

  

  child.stdout.on("data", (data) => process.stdout.write(`[${name}] ${data}`));
  child.stderr.on("data", (data) => process.stderr.write(`[${name}] ${data}`));
  child.on("exit", (code) => {
    if (code) process.stderr.write(`[${name}] exited with code ${code}\n`);
  });

  return child;
});

function shutdown() {
  for (const child of children) child.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

