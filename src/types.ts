export type ReviewDecision =
  | "APPROVED"
  | "CHANGES_REQUESTED"
  | "REVIEW_REQUIRED"
  | "";

export interface PR {
  number: number;
  title: string;
  repo: string; // e.g. "server" (short name)
  repoFullName: string; // e.g. "SSK-TBD/server"
  url: string;
  author: string;
  commentsCount: number;
  isDraft: boolean;
  reviewDecision: ReviewDecision;
  updatedAt: string;
}

export interface ReviewRequest {
  number: number;
  title: string;
  repo: string;
  repoFullName: string;
  url: string;
  author: string;
  updatedAt: string;
}

export interface Notification {
  reason: string; // "review_requested" | "author" | "assign" | "state_change" | ...
  title: string;
  url: string; // API URL like https://api.github.com/repos/.../pulls/123
  unread: boolean;
  updatedAt: string;
}

export type ActionItem = {
  number: number;
  title: string;
  repo: string;
  repoFullName: string;
  url: string;
  reason: string; // "comment" | "review_requested"
  updatedAt: string;
  author?: string;
};

export interface DashboardData {
  actionRequired: ActionItem[];
  myPRs: PR[];
  reviewRequests: ReviewRequest[];
  username: string;
  lastUpdated: Date | null;
  isLoading: boolean;
  error: string | null;
}
