import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { test, expect } from "bun:test";

const CLI_PATH = resolve(import.meta.dir, "../dist/cli.js");

test("cli starts in demo mode without errors", async () => {
  const child = spawn("node", [CLI_PATH, "--demo"], { stdio: "pipe" });
  let stderr = "";
  child.stderr!.on("data", (d) => (stderr += d));

  await new Promise((r) => setTimeout(r, 2000));

  expect(child.exitCode).toBeNull();
  expect(stderr).toBe("");

  child.kill();
});
