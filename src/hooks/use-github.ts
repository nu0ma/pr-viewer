import { useState, useEffect, useCallback, useRef } from "react";
import type {
  PR,
  ReviewRequest,
  Notification,
  ActionItem,
  DashboardData,
  ReviewDecision,
} from "../types.js";

async function exec(cmd: string[]): Promise<string> {
  const proc = Bun.spawn(cmd, {
    stdout: "pipe",
    stderr: "pipe",
  });
  const text = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Command failed: ${cmd.join(" ")}\n${stderr}`);
  }
  return text.trim();
}

async function getUsername(): Promise<string> {
  const output = await exec([
    "gh",
    "api",
    "user",
    "--jq",
    ".login",
  ]);
  return output;
}

interface GhSearchPR {
  number: number;
  title: string;
  repository: { name: string; nameWithOwner: string };
  author: { login: string };
  updatedAt: string;
  url: string;
  commentsCount: number;
  isDraft: boolean;
}

interface GhSearchReviewRequest {
  number: number;
  title: string;
  repository: { name: string; nameWithOwner: string };
  author: { login: string };
  updatedAt: string;
  url: string;
}

interface GhNotification {
  reason: string;
  subject: { type: string; title: string; url: string };
  updated_at: string;
  unread: boolean;
}

async function fetchMyPRs(): Promise<PR[]> {
  const json = await exec([
    "gh",
    "search",
    "prs",
    "--author=@me",
    "--state=open",
    "--json",
    "number,title,repository,author,updatedAt,url,commentsCount,isDraft",
    "--limit",
    "50",
  ]);
  const items: GhSearchPR[] = JSON.parse(json);

  // Fetch review decisions in parallel (batch of 5 at a time)
  const prs: PR[] = items.map((item) => ({
    number: item.number,
    title: item.title,
    repo: item.repository.name,
    repoFullName: item.repository.nameWithOwner,
    url: item.url,
    author: item.author.login,
    commentsCount: item.commentsCount,
    isDraft: item.isDraft,
    reviewDecision: "" as ReviewDecision,
    updatedAt: item.updatedAt,
  }));

  // Fetch review decision for each non-draft PR
  const nonDraftPRs = prs.filter((pr) => !pr.isDraft);
  const batchSize = 5;
  for (let i = 0; i < nonDraftPRs.length; i += batchSize) {
    const batch = nonDraftPRs.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (pr) => {
        try {
          const result = await exec([
            "gh",
            "pr",
            "view",
            pr.url,
            "--json",
            "reviewDecision",
          ]);
          const parsed = JSON.parse(result);
          return {
            url: pr.url,
            reviewDecision: (parsed.reviewDecision || "") as ReviewDecision,
          };
        } catch {
          return { url: pr.url, reviewDecision: "" as ReviewDecision };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        const pr = prs.find((p) => p.url === result.value.url);
        if (pr) {
          pr.reviewDecision = result.value.reviewDecision;
        }
      }
    }
  }

  return prs;
}

async function fetchReviewRequests(): Promise<ReviewRequest[]> {
  const json = await exec([
    "gh",
    "search",
    "prs",
    "--review-requested=@me",
    "--state=open",
    "--json",
    "number,title,repository,author,updatedAt,url",
    "--limit",
    "50",
  ]);
  const items: GhSearchReviewRequest[] = JSON.parse(json);
  return items.map((item) => ({
    number: item.number,
    title: item.title,
    repo: item.repository.name,
    repoFullName: item.repository.nameWithOwner,
    url: item.url,
    author: item.author.login,
    updatedAt: item.updatedAt,
  }));
}

async function fetchNotifications(): Promise<Notification[]> {
  const json = await exec([
    "gh",
    "api",
    "notifications",
    "--jq",
    '[.[] | select(.subject.type == "PullRequest") | {reason: .reason, title: .subject.title, url: .subject.url, unread: .unread, updatedAt: .updated_at}]',
  ]);
  return JSON.parse(json);
}

function buildActionRequired(
  myPRs: PR[],
  reviewRequests: ReviewRequest[],
  notifications: Notification[]
): ActionItem[] {
  const actions: ActionItem[] = [];

  // My PRs with new comments (notification reason = "author" means activity on my PR)
  const myPrNotifications = notifications.filter(
    (n) => n.unread && (n.reason === "author" || n.reason === "comment")
  );

  for (const notification of myPrNotifications) {
    // Extract repo and PR number from API URL
    const match = notification.url.match(
      /repos\/([^/]+\/[^/]+)\/pulls\/(\d+)/
    );
    if (!match) continue;
    const repoFullName = match[1]!;
    const prNumber = parseInt(match[2]!, 10);

    const myPR = myPRs.find(
      (pr) => pr.repoFullName === repoFullName && pr.number === prNumber
    );
    if (myPR) {
      actions.push({
        number: myPR.number,
        title: myPR.title,
        repo: myPR.repo,
        repoFullName: myPR.repoFullName,
        url: myPR.url,
        reason: "comment",
        updatedAt: notification.updatedAt,
      });
    }
  }

  // Review requests from others
  for (const rr of reviewRequests) {
    // Check if this is unread in notifications
    const isUnread = notifications.some(
      (n) =>
        n.unread &&
        n.reason === "review_requested" &&
        n.url.includes(`/${rr.repoFullName}/`) &&
        n.url.endsWith(`/${rr.number}`)
    );

    if (isUnread) {
      actions.push({
        number: rr.number,
        title: rr.title,
        repo: rr.repo,
        repoFullName: rr.repoFullName,
        url: rr.url,
        reason: "review_requested",
        updatedAt: rr.updatedAt,
        author: rr.author,
      });
    }
  }

  // Sort by updatedAt descending
  actions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return actions;
}

export function useGitHub(intervalMs: number) {
  const [data, setData] = useState<DashboardData>({
    actionRequired: [],
    myPRs: [],
    reviewRequests: [],
    username: "",
    lastUpdated: null,
    isLoading: true,
    error: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    setData((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const [username, myPRs, reviewRequests, notifications] =
        await Promise.all([
          data.username || getUsername(),
          fetchMyPRs(),
          fetchReviewRequests(),
          fetchNotifications(),
        ]);

      const actionRequired = buildActionRequired(
        myPRs,
        reviewRequests,
        notifications
      );

      setData({
        actionRequired,
        myPRs,
        reviewRequests,
        username,
        lastUpdated: new Date(),
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [data.username]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(refresh, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, intervalMs]);

  return { data, refresh };
}
