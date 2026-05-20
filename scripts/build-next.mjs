import { spawn } from "node:child_process"
import process from "node:process"

const child = spawn(
  process.execPath,
  ["./node_modules/next/dist/bin/next", "build", ...process.argv.slice(2)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: "production",
    },
    stdio: "inherit",
  },
)

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 1)
})
