import type { PR, ReviewDecision } from "../types.js";
import { Section } from "./section.js";
import { PRRow } from "./pr-row.js";

interface MyPRsProps {
  prs: PR[];
}

function statusLabel(pr: PR): { label: string; color: string } {
  if (pr.isDraft) {
    return { label: "📝 Draft", color: "gray" };
  }
  switch (pr.reviewDecision as ReviewDecision) {
    case "APPROVED":
      return { label: "✅ Approved", color: "green" };
    case "CHANGES_REQUESTED":
      return { label: "🔄 Changes req", color: "red" };
    case "REVIEW_REQUIRED":
      return { label: "⏳ Pending review", color: "yellow" };
    default:
      return { label: "⏳ Pending", color: "yellow" };
  }
}

function sortByRepo<T extends { repo: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.repo.localeCompare(b.repo));
}

export function MyPRs({ prs }: MyPRsProps) {
  const sorted = sortByRepo(prs);

  return (
    <Section icon="📤" title="MY PRS" count={prs.length} color="blue">
      {sorted.map((pr, i) => {
        const { label, color } = statusLabel(pr);
        const prevRepo = i > 0 ? sorted[i - 1]!.repo : null;
        return (
          <PRRow
            key={`${pr.repoFullName}#${pr.number}`}
            repo={pr.repo}
            number={pr.number}
            title={pr.title}
            url={pr.url}
            author={pr.author}
            status={label}
            statusColor={color}
            showRepo={pr.repo !== prevRepo}
          />
        );
      })}
    </Section>
  );
}
