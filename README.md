# pr-watcher

A CLI dashboard for real-time monitoring of GitHub PR status in your terminal.

Displays your created PRs, review requests, and items requiring action at a glance.

## Prerequisites

- [Bun](https://bun.sh/) installed
- [GitHub CLI (`gh`)](https://cli.github.com/) installed and authenticated

```sh
gh auth status  # Check authentication status
```

## Installation

```sh
bun install
```

## Usage

```sh
bun run start
```

### Options

| Flag | Description | Default |
|---|---|---|
| `--interval`, `-i` | Auto-refresh interval (minutes) | `10` |

```sh
# Refresh every 5 minutes
bun run start -- --interval 5
bun run start -- -i 5
```

### Development Mode

Automatically reloads on file changes.

```sh
bun run dev
```

## Key Bindings

| Key | Action |
|---|---|
| `r` | Manually trigger an immediate refresh |
| `q` / `Ctrl+C` | Quit |

## Display

- **My PRs** — Your open PRs (with review status and comment count)
- **Review Requests** — PRs where your review is requested
- **Action Required** — PRs with unread notifications (new comments, review requests, etc.)
