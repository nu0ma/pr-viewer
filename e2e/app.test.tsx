import { test, expect } from "bun:test";
import { render } from "ink-testing-library";
import { App } from "../src/app.js";

function stripAnsi(str: string): string {
  return str.replace(/\x1b\]8;;[^\x07]*\x07/g, "").replace(/\x1b\[[0-9;]*m/g, "");
}

test("renders demo dashboard with expected sections", () => {
  const { lastFrame } = render(<App intervalMinutes={10} demo />);
  const frame = stripAnsi(lastFrame()!);

  expect(frame).toContain("PR Watcher");
  expect(frame).toContain("octocat");
  expect(frame).toContain("MY PRS");
  expect(frame).toContain("REVIEW REQUESTS");
  expect(frame).toContain("ACTION REQUIRED");
});

test("renders demo PR titles", () => {
  const { lastFrame } = render(<App intervalMinutes={10} demo />);
  const frame = stripAnsi(lastFrame()!);

  expect(frame).toContain("add dark mode support");
  expect(frame).toContain("implement OAuth2 PKCE");
});
