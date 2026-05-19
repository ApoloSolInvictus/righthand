import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, "build"], {
  env: {
    ...process.env,
    NEXT_PRIVATE_BUILD_WORKER: "0",
    NEXT_TELEMETRY_DISABLED: "1",
  },
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
