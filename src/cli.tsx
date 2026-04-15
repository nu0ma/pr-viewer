#!/usr/bin/env bun
import { render } from "ink";
import { App } from "./app.js";

const args = process.argv.slice(2);
let intervalMinutes = 10;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--interval" || args[i] === "-i") {
    const val = parseInt(args[i + 1] ?? "", 10);
    if (!isNaN(val) && val > 0) {
      intervalMinutes = val;
    }
    i++;
  }
}

const { waitUntilExit } = render(<App intervalMinutes={intervalMinutes} />, {
  alternateScreen: true,
});

await waitUntilExit();
