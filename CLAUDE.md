# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

pr-watcher (`@nu0ma/pr-watcher`) is a terminal dashboard for monitoring GitHub pull requests. It's a CLI tool built with React + Ink (terminal UI framework) that shows your open PRs, review requests, and action items. It requires `gh` (GitHub CLI) to be installed and authenticated.

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Run in watch mode (auto-restart on file changes)
bun run start            # Run once
bun run build            # Bundle to dist/cli.js (ESM, node target, external packages)
bun run typecheck        # TypeScript type checking (tsc --noEmit)
```

There are no tests yet. When adding tests, use `bun test` with `import { test, expect } from "bun:test"`.

## Tooling

Default to Bun instead of Node.js — use `bun` / `bun run` / `bun install` / `bun test` / `bun build`.

## Architecture

```
src/cli.tsx          → Entry point: parses CLI args (--interval, --demo), renders Ink app
src/app.tsx          → Main React component: layout, keyboard input (r=refresh, q=quit), loading/error states
src/types.ts         → TypeScript interfaces (PR, ReviewRequest, Notification, ActionItem, DashboardData)
src/hooks/
  use-github.ts      → Core data layer: fetches PRs/reviews/notifications via `gh` CLI commands
src/components/
  header.tsx         → Username, last update time, refresh interval
  footer.tsx         → Key bindings, refresh countdown
  my-prs.tsx         → User's open PRs with review status (Approved/Changes Requested/Pending/Draft)
  review-requests.tsx→ PRs requesting user's review
  action-required.tsx→ Combined view of PRs needing attention
  pr-row.tsx         → Reusable PR row with terminal hyperlinks to GitHub
  section.tsx        → Reusable section header with column layout
```

**Data flow:** CLI args → `<App>` → `useGitHub` hook → `gh` CLI subprocess calls → React state → Ink terminal rendering

**Key design decisions:**
- Uses GitHub CLI (`gh api`, `gh pr list`, `gh search prs`) via `Bun.spawn` rather than a GitHub SDK
- Review decisions are fetched in batches of 5 to avoid rate limiting
- Auto-refresh runs on a configurable interval (default 10 minutes)
- `--demo` flag provides hardcoded data for testing without GitHub auth

## Publishing

Published to npm as `@nu0ma/pr-watcher`. Release flow:
1. Run "Create Release PR" workflow (manual dispatch with version type)
2. Merge the Release-labeled PR
3. "Release" workflow auto-publishes to npm with OIDC trusted publishing, creates git tag and GitHub Release
